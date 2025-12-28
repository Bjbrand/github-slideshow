import requests
import sys
import json
import os
from datetime import datetime, timedelta
import tempfile

class SonicRecordsAPITester:
    def __init__(self, base_url="https://studiobooking.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.client_token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data
        self.test_client = {
            "name": f"Test Client {datetime.now().strftime('%H%M%S')}",
            "email": f"testclient{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "phone": "+1234567890",
            "company_name": "Test Band"
        }
        
        self.admin_credentials = {
            "email": "admin@sonic.com",
            "password": "admin123"
        }
        
        self.booking_data = {
            "service_type": "Recording",
            "date": (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d'),
            "time": "14:00",
            "duration": 3,
            "notes": "Test booking for API testing"
        }

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def make_request(self, method, endpoint, data=None, headers=None, files=None):
        """Make HTTP request with error handling"""
        url = f"{self.api_url}/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        
        if headers:
            default_headers.update(headers)
        
        if files:
            # Remove Content-Type for file uploads
            default_headers.pop('Content-Type', None)
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers=default_headers)
                else:
                    response = requests.post(url, json=data, headers=default_headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=default_headers)
            
            return response
        except Exception as e:
            print(f"Request error: {str(e)}")
            return None

    def test_client_registration(self):
        """Test client registration"""
        response = self.make_request('POST', 'auth/register', self.test_client)
        
        if response and response.status_code == 200:
            data = response.json()
            if 'token' in data and 'user' in data:
                self.client_token = data['token']
                self.log_test("Client Registration", True)
                return True
            else:
                self.log_test("Client Registration", False, "Missing token or user in response")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Client Registration", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        return False

    def test_admin_login(self):
        """Test admin login"""
        response = self.make_request('POST', 'auth/login', self.admin_credentials)
        
        if response and response.status_code == 200:
            data = response.json()
            if 'token' in data and data['user']['role'] == 'admin':
                self.admin_token = data['token']
                self.log_test("Admin Login", True)
                return True
            else:
                self.log_test("Admin Login", False, "Missing token or incorrect role")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Admin Login", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        return False

    def test_client_login(self):
        """Test client login with registered credentials"""
        login_data = {
            "email": self.test_client["email"],
            "password": self.test_client["password"]
        }
        response = self.make_request('POST', 'auth/login', login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if 'token' in data and data['user']['role'] == 'client':
                self.log_test("Client Login", True)
                return True
            else:
                self.log_test("Client Login", False, "Missing token or incorrect role")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Client Login", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        return False

    def test_contract_endpoints(self):
        """Test contract-related endpoints"""
        if not self.client_token:
            self.log_test("Contract Status Check", False, "No client token")
            return False
        
        headers = {'Authorization': f'Bearer {self.client_token}'}
        
        # Check contract status
        response = self.make_request('GET', 'contract/status', headers=headers)
        if response and response.status_code == 200:
            self.log_test("Contract Status Check", True)
        else:
            self.log_test("Contract Status Check", False, f"Status: {response.status_code if response else 'None'}")
            return False
        
        # Accept contract
        response = self.make_request('POST', 'contract/accept', {}, headers=headers)
        if response and response.status_code == 200:
            self.log_test("Contract Acceptance", True)
        else:
            self.log_test("Contract Acceptance", False, f"Status: {response.status_code if response else 'None'}")
            return False
        
        # Get contract PDF
        response = self.make_request('GET', 'contract/pdf')
        if response and response.status_code == 200 and response.headers.get('content-type') == 'application/pdf':
            self.log_test("Contract PDF Generation", True)
        else:
            self.log_test("Contract PDF Generation", False, f"Status: {response.status_code if response else 'None'}")
        
        return True

    def test_booking_creation(self):
        """Test booking creation and invoice generation"""
        if not self.client_token:
            self.log_test("Booking Creation", False, "No client token")
            return None
        
        headers = {'Authorization': f'Bearer {self.client_token}'}
        response = self.make_request('POST', 'bookings', self.booking_data, headers=headers)
        
        if response and response.status_code == 200:
            booking = response.json()
            self.booking_id = booking['id']
            self.log_test("Booking Creation", True)
            
            # Test invoice generation
            invoice_response = self.make_request('GET', f'bookings/{self.booking_id}/invoice', headers=headers)
            if invoice_response and invoice_response.status_code == 200:
                self.log_test("Invoice PDF Generation", True)
            else:
                self.log_test("Invoice PDF Generation", False, f"Status: {invoice_response.status_code if invoice_response else 'None'}")
            
            return booking
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Booking Creation", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return None

    def test_payment_workflow(self, booking):
        """Test payment proof upload and approval workflow"""
        if not booking or not self.client_token or not self.admin_token:
            self.log_test("Payment Workflow", False, "Missing required tokens or booking")
            return False
        
        # Create a dummy file for upload
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
            tmp_file.write(b'dummy image content for testing')
            tmp_file_path = tmp_file.name
        
        try:
            # Upload payment proof as client
            headers = {'Authorization': f'Bearer {self.client_token}'}
            with open(tmp_file_path, 'rb') as f:
                files = {'file': ('payment_proof.jpg', f, 'image/jpeg')}
                response = self.make_request('POST', f'bookings/{booking["id"]}/payment-proof', 
                                           headers=headers, files=files)
            
            if response and response.status_code == 200:
                self.log_test("Payment Proof Upload", True)
            else:
                self.log_test("Payment Proof Upload", False, f"Status: {response.status_code if response else 'None'}")
                return False
            
            # Approve payment as admin
            admin_headers = {'Authorization': f'Bearer {self.admin_token}'}
            response = self.make_request('POST', f'bookings/{booking["id"]}/approve-payment', 
                                       {}, headers=admin_headers)
            
            if response and response.status_code == 200:
                self.log_test("Payment Approval", True)
                return True
            else:
                self.log_test("Payment Approval", False, f"Status: {response.status_code if response else 'None'}")
                return False
        
        finally:
            # Clean up temp file
            os.unlink(tmp_file_path)

    def test_project_management(self):
        """Test project-related endpoints"""
        if not self.client_token or not self.admin_token:
            self.log_test("Project Management", False, "Missing required tokens")
            return False
        
        # Get projects as client
        headers = {'Authorization': f'Bearer {self.client_token}'}
        response = self.make_request('GET', 'projects', headers=headers)
        
        if response and response.status_code == 200:
            projects = response.json()
            self.log_test("Get Client Projects", True)
            
            if projects:
                project = projects[0]
                project_id = project['id']
                
                # Test project detail
                response = self.make_request('GET', f'projects/{project_id}', headers=headers)
                if response and response.status_code == 200:
                    self.log_test("Get Project Detail", True)
                else:
                    self.log_test("Get Project Detail", False, f"Status: {response.status_code if response else 'None'}")
                
                # Test file upload
                with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp_file:
                    tmp_file.write(b'dummy audio content for testing')
                    tmp_file_path = tmp_file.name
                
                try:
                    with open(tmp_file_path, 'rb') as f:
                        files = {'file': ('test_audio.mp3', f, 'audio/mpeg')}
                        response = self.make_request('POST', f'projects/{project_id}/files', 
                                                   headers=headers, files=files)
                    
                    if response and response.status_code == 200:
                        self.log_test("Project File Upload", True)
                        
                        # Test file listing
                        response = self.make_request('GET', f'projects/{project_id}/files', headers=headers)
                        if response and response.status_code == 200:
                            self.log_test("Get Project Files", True)
                        else:
                            self.log_test("Get Project Files", False, f"Status: {response.status_code if response else 'None'}")
                    else:
                        self.log_test("Project File Upload", False, f"Status: {response.status_code if response else 'None'}")
                
                finally:
                    os.unlink(tmp_file_path)
                
                # Test revision request
                revision_data = {
                    "project_id": project_id,
                    "message": "Please adjust the bass levels in the mix"
                }
                response = self.make_request('POST', 'revisions', revision_data, headers=headers)
                if response and response.status_code == 200:
                    self.log_test("Revision Request", True)
                else:
                    self.log_test("Revision Request", False, f"Status: {response.status_code if response else 'None'}")
                
                # Test admin project status update
                admin_headers = {'Authorization': f'Bearer {self.admin_token}'}
                status_data = {"status": "in_progress"}
                response = self.make_request('PATCH', f'projects/{project_id}/status', 
                                           status_data, headers=admin_headers)
                if response and response.status_code == 200:
                    self.log_test("Admin Project Status Update", True)
                else:
                    self.log_test("Admin Project Status Update", False, f"Status: {response.status_code if response else 'None'}")
            
            return True
        else:
            self.log_test("Get Client Projects", False, f"Status: {response.status_code if response else 'None'}")
            return False

    def test_admin_dashboard(self):
        """Test admin dashboard endpoints"""
        if not self.admin_token:
            self.log_test("Admin Dashboard", False, "No admin token")
            return False
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Test dashboard stats
        response = self.make_request('GET', 'admin/dashboard', headers=headers)
        if response and response.status_code == 200:
            self.log_test("Admin Dashboard Stats", True)
        else:
            self.log_test("Admin Dashboard Stats", False, f"Status: {response.status_code if response else 'None'}")
        
        # Test clients list
        response = self.make_request('GET', 'admin/clients', headers=headers)
        if response and response.status_code == 200:
            self.log_test("Admin Clients List", True)
        else:
            self.log_test("Admin Clients List", False, f"Status: {response.status_code if response else 'None'}")
        
        return True

    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting Sonic Records API Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 50)
        
        # Authentication tests
        if not self.test_client_registration():
            print("❌ Client registration failed - stopping tests")
            return False
        
        if not self.test_admin_login():
            print("❌ Admin login failed - stopping tests")
            return False
        
        if not self.test_client_login():
            print("❌ Client login failed")
        
        # Contract workflow
        self.test_contract_endpoints()
        
        # Booking and payment workflow
        booking = self.test_booking_creation()
        if booking:
            self.test_payment_workflow(booking)
        
        # Project management
        self.test_project_management()
        
        # Admin features
        self.test_admin_dashboard()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed")
            failed_tests = [r for r in self.test_results if not r['success']]
            print("\nFailed tests:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
            return False

def main():
    tester = SonicRecordsAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())