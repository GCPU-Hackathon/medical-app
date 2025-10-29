<?php

namespace App\Events;

use App\Models\Study;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VRStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $study;
    public $action;
    public $timestamp;

    /**
     * Create a new event instance.
     */
    public function __construct(Study $study, string $action)
    {
        $this->study = $study;
        $this->action = $action; // 'enabled' or 'disabled'
        $this->timestamp = now()->toISOString();
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('vr-status'),
            new PrivateChannel('study.' . $this->study->id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'vr.status.changed';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'study_id' => $this->study->id,
            'study_code' => $this->study->code,
            'study_title' => $this->study->title,
            'patient_name' => $this->study->patient->first_name . ' ' . $this->study->patient->last_name,
            'is_vr' => $this->study->is_vr,
            'action' => $this->action,
            'timestamp' => $this->timestamp,
            'message' => $this->action === 'enabled' 
                ? "Study {$this->study->code} is now active in VR"
                : "VR access disabled for study {$this->study->code}",
        ];
    }
}
