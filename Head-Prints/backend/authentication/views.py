import json
import hashlib
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import UserProfile


@csrf_exempt
def register(request):
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        response["Access-Control-Allow-Credentials"] = "true"
        return response
    
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    try:
        data = json.loads(request.body)
        
        email = data.get('email')
        username = data.get('username')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        password = data.get('password')
        password_confirm = data.get('password_confirm')
        
        # Validation
        if not all([email, username, first_name, last_name, password, password_confirm]):
            return JsonResponse({'error': 'All fields are required'}, status=400)
            
        if password != password_confirm:
            return JsonResponse({'error': 'Passwords do not match'}, status=400)
            
        # Check if user already exists
        if UserProfile.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already exists'}, status=400)
            
        if UserProfile.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)
        
        # Hash password
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        # Create user
        user = UserProfile.objects.create(
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            password=hashed_password
        )
        
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
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response["Access-Control-Allow-Credentials"] = "true"
        return response
        
    except json.JSONDecodeError:
        response = JsonResponse({'error': 'Invalid JSON'}, status=400)
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        return response
    except Exception as e:
        response = JsonResponse({'error': str(e)}, status=500)
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        return response


@csrf_exempt
def login_user(request):
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        response["Access-Control-Allow-Credentials"] = "true"
        return response
    
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    try:
        data = json.loads(request.body)
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return JsonResponse({'error': 'Email and password required'}, status=400)
        
        # Hash provided password
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        try:
            user = UserProfile.objects.get(email=email, password=hashed_password)
            
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
            response["Access-Control-Allow-Origin"] = "http://localhost:3000"
            response["Access-Control-Allow-Credentials"] = "true"
            return response
            
        except UserProfile.DoesNotExist:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
            
    except json.JSONDecodeError:
        response = JsonResponse({'error': 'Invalid JSON'}, status=400)
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        return response
    except Exception as e:
        response = JsonResponse({'error': str(e)}, status=500)
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        return response


@csrf_exempt
@require_http_methods(["POST"])
def logout_user(request):
    request.session.flush()
    return JsonResponse({'message': 'Logged out successfully'}, status=200)


@require_http_methods(["GET"])
def user_profile(request):
    user_id = request.session.get('user_id')
    
    if not user_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        user = UserProfile.objects.get(id=user_id)
        return JsonResponse({
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        }, status=200)
    except UserProfile.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)