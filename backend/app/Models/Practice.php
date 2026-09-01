<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Practice extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'subject',
        'subject_id',
        'description',
        'created_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'created_date' => 'date:Y-m-d',
        ];
    }

    public function subjectRelation(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }
}
