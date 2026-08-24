#!/usr/bin/env python3
"""
Backend API test suite for EMBZ Designs / Existeance storefront
Tests all endpoints against the public backend URL
"""
import requests
import sys
import json
from datetime import datetime

# Public backend URL from frontend .env
BASE_URL = "https://existence-shop.preview.emergentagent.com/api"

class EMBZAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.tests_run = 0
        self.tests_passed = 0
        self.test_order_number = None  # Track order for cleanup
        self.results = []

    def log(self, message, level="INFO"):
        """Log test messages"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        self.log(f"Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            
            result = {
                "test": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success
            }

            if success:
                self.tests_passed += 1
                self.log(f"✅ PASSED - {name} (Status: {response.status_code})", "PASS")
                try:
                    result["response_data"] = response.json()
                except:
                    result["response_data"] = response.text[:200]
            else:
                self.log(f"❌ FAILED - {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                try:
                    result["error"] = response.json()
                except:
                    result["error"] = response.text[:200]

            self.results.append(result)
            return success, response

        except Exception as e:
            self.log(f"❌ FAILED - {name} - Error: {str(e)}", "ERROR")
            self.results.append({
                "test": name,
                "endpoint": endpoint,
                "success": False,
                "error": str(e)
            })
            return False, None

    def test_merchize_health(self):
        """Test Merchize health endpoint"""
        success, resp = self.run_test(
            "Merchize Health Check",
            "GET",
            "merchize/health",
            200
        )
        if success:
            data = resp.json()
            if data.get("ok") and data.get("total_base_products"):
                self.log(f"   Merchize connected: {data.get('total_base_products')} base products available")
                return True
        return False

    def test_get_categories(self):
        """Test get categories endpoint"""
        success, resp = self.run_test(
            "Get Categories",
            "GET",
            "categories",
            200
        )
        if success:
            cats = resp.json()
            self.log(f"   Found {len(cats)} categories")
        return success

    def test_get_products(self):
        """Test get products with various filters"""
        # Basic products list
        success1, resp1 = self.run_test(
            "Get Products (basic)",
            "GET",
            "products",
            200
        )
        
        # With search query
        success2, resp2 = self.run_test(
            "Get Products (search)",
            "GET",
            "products",
            200,
            params={"query": "shirt"}
        )
        
        # With sort
        success3, resp3 = self.run_test(
            "Get Products (sort price_asc)",
            "GET",
            "products",
            200,
            params={"sort": "price_asc"}
        )
        
        # With pagination
        success4, resp4 = self.run_test(
            "Get Products (pagination)",
            "GET",
            "products",
            200,
            params={"page": 1, "limit": 12}
        )
        
        if success1:
            data = resp1.json()
            self.log(f"   Total products: {data.get('total')}, Page: {data.get('page')}, Pages: {data.get('pages')}")
            products = data.get('products', [])
            if products:
                self.log(f"   First product: {products[0].get('title')}")
                return products[0].get('id')  # Return first product ID for detail test
        
        return None

    def test_get_product_detail(self, product_id):
        """Test get single product detail"""
        if not product_id:
            self.log("⚠️  Skipping product detail test - no product ID available")
            return False
            
        success, resp = self.run_test(
            "Get Product Detail",
            "GET",
            f"products/{product_id}",
            200
        )
        
        if success:
            product = resp.json()
            self.log(f"   Product: {product.get('title')}")
            self.log(f"   Price: ${product.get('price')}")
            self.log(f"   Variants: {len(product.get('variants', []))}")
            return product
        return None

    def test_admin_catalog(self):
        """Test admin catalog endpoints"""
        # Get catalog
        success1, resp1 = self.run_test(
            "Admin Catalog (basic)",
            "GET",
            "admin/catalog",
            200,
            params={"page": 1, "limit": 24}
        )
        
        # Get catalog categories
        success2, resp2 = self.run_test(
            "Admin Catalog Categories",
            "GET",
            "admin/catalog/categories",
            200
        )
        
        if success1:
            data = resp1.json()
            self.log(f"   Base products: {data.get('total')}")
            products = data.get('products', [])
            if products:
                return products[0].get('id')  # Return first base product ID
        
        return None

    def test_import_product(self, base_product_id):
        """Test importing a product from catalog"""
        if not base_product_id:
            self.log("⚠️  Skipping import test - no base product ID available")
            return None
            
        payload = {
            "base_product_id": base_product_id,
            "title": "Test Product Import",
            "description": "Test product for API testing",
            "category": "Apparel",
            "price": 29.99,
            "design_images": ["https://via.placeholder.com/800"],
            "design_front": "https://via.placeholder.com/800",
            "published": False  # Don't publish test product
        }
        
        success, resp = self.run_test(
            "Import Product",
            "POST",
            "admin/store-products",
            200,
            data=payload
        )
        
        if success:
            product = resp.json()
            self.log(f"   Imported product ID: {product.get('id')}")
            return product.get('id')
        return None

    def test_update_product(self, product_id):
        """Test updating a store product"""
        if not product_id:
            self.log("⚠️  Skipping update test - no product ID available")
            return False
            
        payload = {
            "price": 34.99,
            "published": False
        }
        
        success, resp = self.run_test(
            "Update Store Product",
            "PUT",
            f"admin/store-products/{product_id}",
            200,
            data=payload
        )
        return success

    def test_delete_product(self, product_id):
        """Test deleting a store product"""
        if not product_id:
            self.log("⚠️  Skipping delete test - no product ID available")
            return False
            
        success, resp = self.run_test(
            "Delete Store Product",
            "DELETE",
            f"admin/store-products/{product_id}",
            200
        )
        return success

    def test_shipping_quote(self, product_id, variant_id):
        """Test shipping quote for different countries"""
        if not product_id or not variant_id:
            self.log("⚠️  Skipping shipping quote test - no product/variant available")
            return None
            
        countries = ["US", "GB", "AU"]
        quote_results = {}
        
        for country in countries:
            payload = {
                "country": country,
                "items": [
                    {
                        "store_product_id": product_id,
                        "variant_id": variant_id,
                        "quantity": 1
                    }
                ]
            }
            
            success, resp = self.run_test(
                f"Shipping Quote ({country})",
                "POST",
                "shipping/quote",
                200,
                data=payload
            )
            
            if success:
                quote = resp.json()
                options = quote.get('options', [])
                self.log(f"   {country}: {len(options)} options")
                for opt in options:
                    self.log(f"      {opt.get('name')}: ${opt.get('cost')} ({opt.get('eta_label')})")
                quote_results[country] = quote
        
        return quote_results.get("US")  # Return US quote for checkout test

    def test_checkout(self, product_id, variant_id, shipping_cost=9.99):
        """Test checkout - creates REAL Merchize order"""
        if not product_id or not variant_id:
            self.log("⚠️  Skipping checkout test - no product/variant available")
            return None
            
        payload = {
            "shipping_info": {
                "full_name": "Test Customer",
                "email": "test@embzdesigns.com",
                "phone": "555-0123",
                "address_1": "123 Test Street",
                "address_2": "",
                "city": "Los Angeles",
                "state": "CA",
                "postcode": "90001",
                "country": "US"
            },
            "items": [
                {
                    "store_product_id": product_id,
                    "variant_id": variant_id,
                    "quantity": 1
                }
            ],
            "shipping_method": "standard",
            "shipping_cost": shipping_cost,
            "notes": "API test order - please cancel"
        }
        
        self.log("⚠️  WARNING: Creating REAL Merchize order for testing")
        success, resp = self.run_test(
            "Checkout (creates REAL order)",
            "POST",
            "checkout",
            200,
            data=payload
        )
        
        if success:
            order = resp.json()
            self.test_order_number = order.get('external_number')
            self.log(f"   Order created: {self.test_order_number}")
            self.log(f"   Merchize synced: {order.get('merchize_synced')}")
            self.log(f"   Total: ${order.get('total')}")
            return self.test_order_number
        return None

    def test_get_order(self, order_number):
        """Test get order detail"""
        if not order_number:
            self.log("⚠️  Skipping order detail test - no order number available")
            return False
            
        success, resp = self.run_test(
            "Get Order Detail",
            "GET",
            f"orders/{order_number}",
            200
        )
        
        if success:
            data = resp.json()
            self.log(f"   Local order: {data.get('local', {}).get('status')}")
            self.log(f"   Merchize detail: {'present' if data.get('merchize') else 'none'}")
        return success

    def test_get_tracking(self, order_number):
        """Test get order tracking"""
        if not order_number:
            self.log("⚠️  Skipping tracking test - no order number available")
            return False
            
        success, resp = self.run_test(
            "Get Order Tracking",
            "GET",
            f"orders/{order_number}/tracking",
            200
        )
        
        if success:
            data = resp.json()
            self.log(f"   Status: {data.get('status')}")
            self.log(f"   Tracking: {data.get('tracking') or 'Not yet available'}")
        return success

    def test_admin_orders(self):
        """Test admin orders list"""
        success, resp = self.run_test(
            "Admin Orders List",
            "GET",
            "admin/orders",
            200
        )
        
        if success:
            orders = resp.json()
            self.log(f"   Total orders: {len(orders)}")
        return success

    def test_cancel_order(self, order_number):
        """Test cancelling an order - CLEANUP"""
        if not order_number:
            self.log("⚠️  No order to cancel")
            return False
            
        self.log(f"🧹 CLEANUP: Cancelling test order {order_number}")
        success, resp = self.run_test(
            "Cancel Order (cleanup)",
            "POST",
            f"admin/orders/{order_number}/cancel",
            200
        )
        
        if success:
            data = resp.json()
            self.log(f"   Cancel success: {data.get('success')}")
            self.log(f"   Message: {data.get('message')}")
        return success

    def test_order_actions(self, order_number):
        """Test other order actions (push, hold, resume)"""
        if not order_number:
            self.log("⚠️  Skipping order actions test - no order number available")
            return False
            
        # Test push (may fail if already cancelled, that's OK)
        success1, resp1 = self.run_test(
            "Order Action: Push",
            "POST",
            f"admin/orders/{order_number}/push",
            200
        )
        
        # Test hold (may fail if cancelled, that's OK)
        success2, resp2 = self.run_test(
            "Order Action: Hold",
            "POST",
            f"admin/orders/{order_number}/hold",
            200
        )
        
        # Test resume (may fail if cancelled, that's OK)
        success3, resp3 = self.run_test(
            "Order Action: Resume",
            "POST",
            f"admin/orders/{order_number}/resume",
            200
        )
        
        return True  # We just need to verify endpoints respond

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*70)
        print("TEST SUMMARY")
        print("="*70)
        print(f"Total tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        print("="*70)
        
        # Save detailed results
        with open('/app/backend/test_results.json', 'w') as f:
            json.dump({
                "summary": {
                    "total": self.tests_run,
                    "passed": self.tests_passed,
                    "failed": self.tests_run - self.tests_passed,
                    "success_rate": f"{(self.tests_passed/self.tests_run*100):.1f}%"
                },
                "results": self.results
            }, f, indent=2)
        
        print(f"\nDetailed results saved to: /app/backend/test_results.json")
        
        return 0 if self.tests_passed == self.tests_run else 1

def main():
    print("="*70)
    print("EMBZ DESIGNS / EXISTEANCE - Backend API Test Suite")
    print(f"Testing against: {BASE_URL}")
    print("="*70 + "\n")
    
    tester = EMBZAPITester()
    
    # 1. Test Merchize health
    tester.test_merchize_health()
    
    # 2. Test storefront endpoints
    tester.test_get_categories()
    product_id = tester.test_get_products()
    product = tester.test_get_product_detail(product_id)
    
    # 3. Test admin catalog
    base_product_id = tester.test_admin_catalog()
    
    # 4. Test product import/update/delete flow
    imported_id = tester.test_import_product(base_product_id)
    tester.test_update_product(imported_id)
    
    # 5. Test shipping quote
    if product:
        variant_id = product.get('variants', [{}])[0].get('id')
        quote = tester.test_shipping_quote(product_id, variant_id)
        
        # 6. Test checkout (creates REAL order)
        shipping_cost = 9.99
        if quote and quote.get('options'):
            shipping_cost = quote['options'][0].get('cost', 9.99)
        
        order_number = tester.test_checkout(product_id, variant_id, shipping_cost)
        
        # 7. Test order endpoints
        tester.test_get_order(order_number)
        tester.test_get_tracking(order_number)
        tester.test_admin_orders()
        
        # 8. Test order actions
        tester.test_order_actions(order_number)
        
        # 9. CLEANUP: Cancel the test order
        tester.test_cancel_order(order_number)
    
    # 10. Cleanup: Delete test imported product
    tester.test_delete_product(imported_id)
    
    # Print summary
    return tester.print_summary()

if __name__ == "__main__":
    sys.exit(main())
