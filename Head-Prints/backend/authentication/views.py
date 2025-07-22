import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.hashers import make_password, check_password
from .models import UserProfile


def add_cors_headers(response):
    """Add CORS headers to response"""
    response["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type"
    response["Access-Control-Allow-Credentials"] = "true"
    return response


@csrf_exempt
def register(request):
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        return add_cors_headers(response)
    
    if request.method != 'POST':
        response = JsonResponse({'error': 'Method not allowed'}, status=405)
        return add_cors_headers(response)
    
    try:
        data = json.loads(request.body)
        
        email = data.get('email', '').strip().lower()  # Normalize email
        username = data.get('username', '').strip()
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        password = data.get('password', '')
        password_confirm = data.get('password_confirm', '')
        
        # Validation
        if not all([email, username, first_name, last_name, password, password_confirm]):
            response = JsonResponse({'error': 'All fields are required'}, status=400)
            return add_cors_headers(response)
            
        if len(password) < 6:
            response = JsonResponse({'error': 'Password must be at least 6 characters'}, status=400)
            return add_cors_headers(response)
            
        if password != password_confirm:
            response = JsonResponse({'error': 'Passwords do not match'}, status=400)
            return add_cors_headers(response)
            
        # Check if user already exists
        if UserProfile.objects.filter(email=email).exists():
            response = JsonResponse({'error': 'Email already exists'}, status=400)
            return add_cors_headers(response)
            
        if UserProfile.objects.filter(username=username).exists():
            response = JsonResponse({'error': 'Username already exists'}, status=400)
            return add_cors_headers(response)
        
        # Hash password using Django's secure hashing
        hashed_password = make_password(password)
        
        # Create user
        user = UserProfile.objects.create(
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            password=hashed_password
        )
        
        # Set session
        request.session['user_id'] = user.id
        request.session['is_authenticated'] = True
        
        response = JsonResponse({
            'message': 'User created successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        }, status=201)
        return add_cors_headers(response)
        
    except json.JSONDecodeError:
        response = JsonResponse({'error': 'Invalid JSON data'}, status=400)
        return add_cors_headers(response)
    except Exception as e:
        print(f"Registration error: {str(e)}")  # For debugging
        response = JsonResponse({'error': 'Internal server error'}, status=500)
        return add_cors_headers(response)


@csrf_exempt
def login_user(request):
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        return add_cors_headers(response)
    
    if request.method != 'POST':
        response = JsonResponse({'error': 'Method not allowed'}, status=405)
        return add_cors_headers(response)
    
    try:
        data = json.loads(request.body)
        
        email = data.get('email', '').strip().lower()  # Normalize email
        password = data.get('password', '')
        
        if not email or not password:
            response = JsonResponse({'error': 'Email and password are required'}, status=400)
            return add_cors_headers(response)
        
        try:
            # Find user by email
            user = UserProfile.objects.get(email=email)
            
            # Check password using Django's secure password checking
            if check_password(password, user.password):
                # Set session
                request.session['user_id'] = user.id
                request.session['is_authenticated'] = True
                
                response = JsonResponse({
                    'message': 'Login successful',
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'username': user.username,
                        'first_name': user.first_name,
                        'last_name': user.last_name
                    }
                }, status=200)
                return add_cors_headers(response)
            else:
                response = JsonResponse({'error': 'Invalid email or password'}, status=401)
                return add_cors_headers(response)
                
        except UserProfile.DoesNotExist:
            response = JsonResponse({'error': 'Invalid email or password'}, status=401)
            return add_cors_headers(response)
            
    except json.JSONDecodeError:
        response = JsonResponse({'error': 'Invalid JSON data'}, status=400)
        return add_cors_headers(response)
    except Exception as e:
        print(f"Login error: {str(e)}")  # For debugging
        response = JsonResponse({'error': 'Internal server error'}, status=500)
        return add_cors_headers(response)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def logout_user(request):
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        return add_cors_headers(response)
    
    try:
        request.session.flush()
        response = JsonResponse({'message': 'Logged out successfully'}, status=200)
        return add_cors_headers(response)
    except Exception as e:
        print(f"Logout error: {str(e)}")
        response = JsonResponse({'error': 'Logout failed'}, status=500)
        return add_cors_headers(response)


@require_http_methods(["GET", "OPTIONS"])
def user_profile(request):
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        return add_cors_headers(response)
    
    user_id = request.session.get('user_id')
    
    if not user_id:
        response = JsonResponse({'error': 'Not authenticated'}, status=401)
        return add_cors_headers(response)
    
    try:
        user = UserProfile.objects.get(id=user_id)
        response = JsonResponse({
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        }, status=200)
        return add_cors_headers(response)
    except UserProfile.DoesNotExist:
        response = JsonResponse({'error': 'User not found'}, status=404)
        return add_cors_headers(response)