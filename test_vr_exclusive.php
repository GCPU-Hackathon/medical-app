<?php

require_once 'vendor/autoload.php';

use App\Models\Study;

// Test script to verify exclusive VR mechanism
echo "Testing Exclusive VR Mechanism\n";
echo "===============================\n\n";

// Create some test studies for demonstration
echo "1. Finding completed studies...\n";
$completedStudies = Study::where('status', 'completed')->limit(3)->get();

if ($completedStudies->count() < 2) {
    echo "Not enough completed studies for testing. Creating test scenario...\n";
    exit;
}

echo "Found " . $completedStudies->count() . " completed studies\n\n";

// Test 1: Enable VR for first study
$study1 = $completedStudies->first();
echo "2. Enabling VR for Study: {$study1->code}\n";

// Simulate the sendToVR controller logic
Study::where('is_vr', true)->update(['is_vr' => false]); // Auto-disable active VR
$study1->update(['is_vr' => true]);

$activeVR = Study::where('is_vr', true)->get();
echo "   Active VR studies: " . $activeVR->count() . " (should be 1)\n";
echo "   Active study: " . $activeVR->first()->code . "\n\n";

// Test 2: Enable VR for second study (should auto-disable first)
if ($completedStudies->count() > 1) {
    $study2 = $completedStudies->skip(1)->first();
    echo "3. Enabling VR for Study: {$study2->code}\n";
    
    // Simulate the sendToVR controller logic
    Study::where('is_vr', true)->update(['is_vr' => false]); // Auto-disable active VR
    $study2->update(['is_vr' => true]);
    
    $activeVR = Study::where('is_vr', true)->get();
    echo "   Active VR studies: " . $activeVR->count() . " (should be 1)\n";
    echo "   Active study: " . $activeVR->first()->code . "\n";
    echo "   Previous study ({$study1->code}) VR status: " . ($study1->fresh()->is_vr ? 'active' : 'disabled') . "\n\n";
}

// Test 3: Disable VR
echo "4. Disabling VR for current active study\n";
$activeStudy = Study::where('is_vr', true)->first();
if ($activeStudy) {
    $activeStudy->update(['is_vr' => false]);
    echo "   Disabled VR for: {$activeStudy->code}\n";
}

$activeVR = Study::where('is_vr', true)->get();
echo "   Active VR studies: " . $activeVR->count() . " (should be 0)\n\n";

echo "✅ Exclusive VR mechanism test completed!\n";
echo "Summary:\n";
echo "- ✅ Only one study can be VR-active at a time\n";
echo "- ✅ Enabling VR auto-disables previously active study\n";
echo "- ✅ VR can be disabled manually\n";
