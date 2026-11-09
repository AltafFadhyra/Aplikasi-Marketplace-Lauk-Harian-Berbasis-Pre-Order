<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login()
    {
        return inertia('Auth/Login');
    }

    public function register()
    {
        return inertia('Auth/Register');
    }

    public function registerSeller()
    {
        return inertia('Auth/RegisterSeller');
    }

    public function registerCourier()
    {
        return inertia('Auth/RegisterCourier');
    }

    public function forgotPassword()
    {
        return inertia('Auth/ForgotPassword');
    }

    public function verifyOtp()
    {
        return inertia('Auth/VerifyOtp');
    }

    public function resetPassword()
    {
        return inertia('Auth/ResetPassword');
    }

    public function changePassword()
    {
        return inertia('Auth/ChangePassword');
    }

    public function akunDemo()
    {
        return inertia('Auth/DemoAccounts');
    }
}
