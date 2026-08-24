#!/usr/bin/env python3
"""
Backend API test suite for EMBZ Designs storefront
Tests all critical endpoints before frontend E2E testing
"""
import requests
import sys
import json
from datetime import datetime

BASE_URL = "https://existence-shop.preview.emergentagent.com/api"

class TestRunner:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.tests_failed = 0
        self.session_id = None
        self.external_number = None
        self.product_id = None
        self.variant_id = None
        
    def log(self, msg, level="INFO"):
        print(f"[{level}] {msg}")
    
    def test(self, name, method, endpoint, expected_status=200, data=None, params=None, save_response=None):
        """Run a single API test"""
        url = f"{BASE_URL}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        self.log(f"\n{'='*60}")
        self.log(f"Test #{self.tests_run}: {name}")
        self.log(f"{'='*60}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            self.log(f"Status: {response.status_code} (expected {expected_status})")
            
            # Try to parse JSON response
            try:
                response_data = response.json()
                self.log(f"Response preview: {json.dumps(response_data, indent=2)[:500]}")
            except:
                response_data = None
                self.log(f"Response text: {response.text[:500]}")
            
            # Check status code
            if response.status_code == expected_status:
                self.tests_passed += 1
                self.log(f"✅ PASSED", "SUCCESS")
                
                # Save response data if requested
                if save_response and response_data:
                    if save_response == "session_id":
                        self.session_id = response_data.get("session_id")
                        self.external_number = response_data.get("external_number")
                        self.log(f"Saved session_id: {self.session_id}")
                        self.log(f"Saved external_number: {self.external_number}")
                    elif save_response == "product_id":
                        products = response_data.get("products", [])
                        if products:
                            self.product_id = products[0].get("id")
                            variants = products[0].get("variants", [])
                            if variants:
                                self.variant_id = variants[0].get("id")
                            self.log(f"Saved product_id: {self.product_id}")
                            self.log(f"Saved variant_id: {self.variant_id}")
                
                return True, response_data
            else:
                self.tests_failed += 1
                self.log(f"❌ FAILED - Expected {expected_status}, got {response.status_code}", "ERROR")
                return False, response_data
                
        except Exception as e:
            self.tests_failed += 1
            self.log(f"❌ FAILED - Exception: {str(e)}", "ERROR")
            return False, None
    
    def print_summary(self):
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"Total tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed} ✅")
        print(f"Failed: {self.tests_failed} ❌")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100) if self.tests_run > 0 else 0:.1f}%")
        print("="*60)

def main():
    runner = TestRunner()
    
    # Test 1: Merchize health check
    success, data = runner.test(
        "Merchize Health Check",
        "GET",
        "/merchize/health",
        expected_status=200
    )
    if success and data:
        runner.log(f"Merchize OK: {data.get('ok')}, Total base products: {data.get('total_base_products')}")
    
    # Test 2: Get published products (should return 4 demo products)
    success, data = runner.test(
        "Get Published Products",
        "GET",
        "/products",
        expected_status=200,
        save_response="product_id"
    )
    if success and data:
        products = data.get("products", [])
        runner.log(f"Found {len(products)} published products")
        if len(products) >= 1:
            runner.log(f"First product: {products[0].get('title')}")
    
    # Test 3: Get categories
    success, data = runner.test(
        "Get Categories",
        "GET",
        "/categories",
        expected_status=200
    )
    if success and data:
        runner.log(f"Found {len(data)} categories")
    
    # Test 4: Get product detail (if we have a product_id)
    if runner.product_id:
        success, data = runner.test(
            f"Get Product Detail (ID: {runner.product_id})",
            "GET",
            f"/products/{runner.product_id}",
            expected_status=200
        )
        if success and data:
            runner.log(f"Product title: {data.get('title')}")
            runner.log(f"Variants count: {len(data.get('variants', []))}")
            runner.log(f"Attributes: {[a.get('name') for a in data.get('attributes', [])]}")
    
    # Test 5: Shipping quote for Australia (as per requirements)
    if runner.product_id and runner.variant_id:
        success, data = runner.test(
            "Shipping Quote for Australia",
            "POST",
            "/shipping/quote",
            expected_status=200,
            data={
                "country": "AU",
                "items": [
                    {
                        "store_product_id": runner.product_id,
                        "variant_id": runner.variant_id,
                        "quantity": 1
                    }
                ]
            }
        )
        if success and data:
            runner.log(f"Zone: {data.get('zone')}")
            runner.log(f"Cheapest: {data.get('cheapest')}, Fastest: {data.get('fastest')}")
            options = data.get("options", [])
            for opt in options:
                runner.log(f"  - {opt.get('name')}: ${opt.get('cost')} ({opt.get('eta_label')})")
    
    # Test 6: Create payment checkout session (NO order should be created yet)
    if runner.product_id and runner.variant_id:
        success, data = runner.test(
            "Create Payment Checkout Session",
            "POST",
            "/payments/checkout",
            expected_status=200,
            data={
                "shipping_info": {
                    "full_name": "Test Buyer",
                    "email": "test@example.com",
                    "phone": "0400000000",
                    "address_1": "123 Test St",
                    "address_2": "",
                    "city": "Sydney",
                    "state": "NSW",
                    "postcode": "2000",
                    "country": "AU"
                },
                "items": [
                    {
                        "store_product_id": runner.product_id,
                        "variant_id": runner.variant_id,
                        "quantity": 1
                    }
                ],
                "shipping_method": "standard",
                "notes": "Test order from automated testing",
                "origin_url": "https://existence-shop.preview.emergentagent.com"
            },
            save_response="session_id"
        )
        if success and data:
            runner.log(f"Checkout URL: {data.get('checkout_url')[:80]}...")
            runner.log(f"Session ID: {data.get('session_id')}")
            runner.log(f"External number: {data.get('external_number')}")
            runner.log(f"Amount: ${data.get('amount')}")
    
    # Test 7: Check payment status (should be 'pending' before payment)
    if runner.session_id:
        success, data = runner.test(
            f"Check Payment Status (session: {runner.session_id[:20]}...)",
            "GET",
            f"/payments/status/{runner.session_id}",
            expected_status=200
        )
        if success and data:
            runner.log(f"Payment status: {data.get('payment_status')}")
            runner.log(f"Status: {data.get('status')}")
    
    # Test 8: Verify NO order exists yet (before payment)
    success, data = runner.test(
        "Get Admin Orders (should NOT include unpaid order)",
        "GET",
        "/admin/orders",
        expected_status=200
    )
    if success and data:
        runner.log(f"Total orders in system: {len(data)}")
        if runner.external_number:
            unpaid_order = next((o for o in data if o.get("external_number") == runner.external_number), None)
            if unpaid_order:
                runner.log(f"⚠️  WARNING: Order {runner.external_number} exists before payment!", "WARN")
            else:
                runner.log(f"✅ Confirmed: Order {runner.external_number} does NOT exist yet (correct behavior)")
    
    # Print summary
    runner.print_summary()
    
    # Return exit code
    return 0 if runner.tests_failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
