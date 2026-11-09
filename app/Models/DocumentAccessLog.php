<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentAccessLog extends Model
{
    protected $fillable = [
        'verification_document_id', 'accessed_by', 'action', 'purpose', 'ip_address', 'user_agent',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(VerificationDocument::class, 'verification_document_id');
    }

    public function accessor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accessed_by');
    }
}
