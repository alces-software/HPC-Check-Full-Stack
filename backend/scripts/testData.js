const { ObjectId } = require("mongodb");

module.exports.seedData = async (db) => {
  const peopleCollection = db.collection("person");
  const clustersCollection = db.collection("cluster");
  const instructionsCollection = db.collection("instruction");
  const methodsCollection = db.collection("method");

  // Users
  const users = [
    { _id: new ObjectId(), name: "Oscar" },
    { _id: new ObjectId(), name: "Alex" },
    { _id: new ObjectId(), name: "Callum" },
  ];

  await peopleCollection.insertMany(users);

  // Cluster
  const cognitionCluster = {
    _id: new ObjectId(),
    name: "Cognition",
  };

  await clustersCollection.insertOne(cognitionCluster);

  const instructions = [
    {
      _id: new ObjectId(),
      title: "Login & Basic Access",
      expectedTime: "2-3 mins",
      description: "Confirm login nodes and user-facing hosts are reachable.",
      clusterId: cognitionCluster._id.toString(),
      good: "Successful login and filesystem access on all tested hosts.",
      bad: "Login failures, timeouts, or inaccessible filesystems.",
    },
    {
      _id: new ObjectId(),
      title: "Home Directory & User Quota + Filesystem Experience",
      expectedTime: "6-7 mins",
      description: "Verify quota system and test home filesystem performance.",
      clusterId: cognitionCluster._id.toString(),
      good: "Usage below limits and filesystem tests complete quickly.",
      bad: "Quota issues or poor filesystem performance.",
    },
    {
      _id: new ObjectId(),
      title: "Scratch / Lustre Storage + Filesystem Experience",
      expectedTime: "5-6 mins",
      description: "Verify scratch storage quotas and Lustre performance.",
      clusterId: cognitionCluster._id.toString(),
      good: "Commands succeed with healthy performance.",
      bad: "Filesystem issues, errors, or slow performance.",
    },
    {
      _id: new ObjectId(),
      title: "Slurm Scheduler Status",
      expectedTime: "4-5 mins",
      description: "Confirm scheduler responsiveness and node availability.",
      clusterId: cognitionCluster._id.toString(),
      good: "Nodes visible and scheduler operating normally.",
      bad: "Nodes down/drained or scheduler unresponsive.",
    },
    {
      _id: new ObjectId(),
      title: "GPU / Compute Node Availability",
      expectedTime: "3-4 mins",
      description: "Validate GPU node health and availability.",
      clusterId: cognitionCluster._id.toString(),
      good: "GPU nodes healthy and accessible.",
      bad: "Missing nodes or unhealthy GPU resources.",
    },
    {
      _id: new ObjectId(),
      title: "Light Test Job Submission",
      expectedTime: "5-6 mins",
      description: "Verify jobs can be submitted and completed.",
      clusterId: cognitionCluster._id.toString(),
      good: "Jobs execute successfully.",
      bad: "Jobs fail or remain pending.",
    },
    {
      _id: new ObjectId(),
      title: "Services & Environment",
      expectedTime: "3-4 mins",
      description: "Verify Slurm commands and environment modules.",
      clusterId: cognitionCluster._id.toString(),
      good: "Environment commands work normally.",
      bad: "Broken environment or unavailable commands.",
    },
    {
      _id: new ObjectId(),
      title: "Cleanup & Verification",
      expectedTime: "2 mins",
      description: "Ensure no test artifacts remain.",
      clusterId: cognitionCluster._id.toString(),
      good: "No jobs or files left behind.",
      bad: "Residual jobs, files, or quota usage.",
    },
    {
      _id: new ObjectId(),
      title: "Final Notes / Escalation",
      expectedTime: "1 min",
      description: "Record outcome and escalate issues if required.",
      clusterId: cognitionCluster._id.toString(),
      good: "Daily check completed successfully.",
      bad: "Issues require escalation to OPS.",
    },
  ];

  await instructionsCollection.insertMany(instructions);

  const methods = [];

  const addMethods = (instructionId, items) => {
    items.forEach((content) => {
      methods.push({
        _id: new ObjectId(),
        content,
        instructionId: instructionId.toString(),
      });
    });
  };

  addMethods(instructions[0]._id, [
    "SSH to login1.cognition.gla.alces.network and verify a normal prompt appears.",
    "SSH to a random selection of user-facing nodes.",
    "Confirm home directories and shared filesystems are accessible.",
  ]);

  addMethods(instructions[1]._id, [
    "Run: quota -s",
    "Run: df -h ~",
    "Perform block and metadata filesystem tests using dd and touch.",
    "Create a large test file and verify quota reporting updates correctly.",
  ]);

  addMethods(instructions[2]._id, [
    "Run: lfs quota /mnt/scratch/users/$USER",
    "Verify scratch directory contents are accessible.",
    "Perform large file write and metadata performance tests.",
    "Confirm filesystem performance and quota reporting are acceptable.",
  ]);

  addMethods(instructions[3]._id, [
    "Run: sinfo -Nl",
    "Review partition information using scontrol show partitions.",
    "Inspect nodes using scontrol show node.",
    "Review running jobs and investigate a sample job where possible.",
  ]);

  addMethods(instructions[4]._id, [
    "Review node status using sinfo.",
    "SSH to a selection of GPU nodes and verify responsiveness.",
    "Submit an interactive GPU job and run nvidia-smi health checks.",
    "Inspect a node currently running a GPU workload.",
  ]);

  addMethods(instructions[5]._id, [
    "Run a simple CPU test job with srun.",
    "Monitor queue status using squeue -u $USER.",
    "Submit a small batch script and confirm successful completion.",
  ]);

  addMethods(instructions[6]._id, [
    "Run: module avail",
    "Run: which srun",
    "Run: squeue",
  ]);

  addMethods(instructions[7]._id, [
    "Check for active jobs using squeue -u $USER.",
    "Remove temporary files from home and scratch storage.",
    "Run quota and verify usage has returned to normal.",
  ]);

  addMethods(instructions[8]._id, [
    'If all checks pass, log: "Daily user check complete – no issues".',
    "For any RED item, escalate to OPS with exact command output.",
  ]);

  await methodsCollection.insertMany(methods);

  console.log("✅ Cognition test data seeded");
}