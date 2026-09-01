<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'role',
        'university',
        'student_id',
        'telegram',
        'year',
        'avatar_text',
        'password',
        'reset_code',
        'reset_code_expires_at',
        'remember_token',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'reset_code',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'reset_code_expires_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
