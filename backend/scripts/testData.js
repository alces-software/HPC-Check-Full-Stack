const { ObjectId } = require('mongodb');

module.exports.seedData = async (db) => {
   const personCol = db.collection('person');
   const teamCol = db.collection('team');
   const poolCol = db.collection('pool');
   const clusterCol = db.collection('cluster');
   const teampoolCol = db.collection('teampool');
   const instructionCol = db.collection('instruction');
   const methodCol = db.collection('method');
   const bonusChallengeCol = db.collection('bonusChallenge');

   // -----------------------------
   // Helpers
   // -----------------------------
   const id = () => new ObjectId();
   const str = (x) => x.toString();

   const makeMethods = (instructionId, items) =>
      items.map((content) => ({
         _id: id(),
         instructionId: str(instructionId),
         content
      }));

   const makeInstructions = (clusterId, baseTitle, templates) =>
      templates.map((t, i) => ({
         _id: id(),
         clusterId: str(clusterId),
         title: `${baseTitle} ${i + 1} - ${t.title}`,
         expectedTime: t.time,
         description: t.description,
         good: t.good,
         bad: t.bad
      }));

   // -----------------------------
   // POOLS (3)
   // -----------------------------
   const pools = [
      { _id: id(), name: 'HPC Operations' },
      { _id: id(), name: 'AI Services' },
      { _id: id(), name: 'Infrastructure Health' }
   ];

   await poolCol.insertMany(pools);

   // -----------------------------
   // TEAMS (2)
   // -----------------------------
   const teams = [
      {
         _id: id(),
         name: 'Platform Ops',
         clusters_per_day: 2,
         assigned: true
      },
      {
         _id: id(),
         name: 'AI Engineering',
         clusters_per_day: 2,
         assigned: true
      }
   ];

   await teamCol.insertMany(teams);

   // -----------------------------
   // TEAMPOOL (updated exclusivity model)
   // -----------------------------
   const teampools = [
      // Exclusive pool for Platform Ops
      {
         _id: id(),
         teamId: str(teams[0]._id),
         poolId: str(pools[0]._id)
      },

      // Shared pool (both teams)
      {
         _id: id(),
         teamId: str(teams[0]._id),
         poolId: str(pools[2]._id)
      },
      {
         _id: id(),
         teamId: str(teams[1]._id),
         poolId: str(pools[2]._id)
      },

      // Exclusive pool for AI Engineering
      {
         _id: id(),
         teamId: str(teams[1]._id),
         poolId: str(pools[1]._id)
      }
   ];
   teampoolCol.insertMany(teampools);
   // -----------------------------
   // PEOPLE (5)
   // -----------------------------
   const people = [
      { _id: id(), name: 'Oscar', teamId: str(teams[0]._id) },
      { _id: id(), name: 'Alex', teamId: str(teams[0]._id) },
      { _id: id(), name: 'Calum', teamId: str(teams[0]._id) },
      { _id: id(), name: 'Sarah', teamId: str(teams[1]._id) },
      { _id: id(), name: 'Priya', teamId: str(teams[1]._id) }
   ];

   await personCol.insertMany(people);

   // -----------------------------
   // CLUSTERS (5)
   // -----------------------------
   const clusters = [
      { _id: id(), name: 'Compute Stability', poolId: str(pools[0]._id) },
      { _id: id(), name: 'Storage Integrity', poolId: str(pools[0]._id) },
      { _id: id(), name: 'Inference Reliability', poolId: str(pools[1]._id) },
      { _id: id(), name: 'Training Pipeline', poolId: str(pools[1]._id) },
      { _id: id(), name: 'Network & Services', poolId: str(pools[2]._id) }
   ];

   await clusterCol.insertMany(clusters);

   // -----------------------------
   // BONUS CHALLENGES
   // -----------------------------
   const bonusChallenges = [
      {
         _id: id(),
         title: 'Queue Controller',
         description:
            'Submit a short test job, locate its job ID using squeue, then cancel it before it finishes.',
         active: true
      },
      {
         _id: id(),
         title: 'Job Tracker',
         description:
            'Identify the state of one of your jobs, or confirm that you have no active jobs.',
         active: true
      },
      {
         _id: id(),
         title: 'Partition Explorer',
         description: 'Identify a partition with idle or mixed nodes.',
         active: true
      },
      {
         _id: id(),
         title: 'Pending Detective',
         description: 'Find a pending job in the queue and identify the reason it is waiting.',
         active: true
      },
      {
         _id: id(),
         title: 'Output Hunter',
         description: 'Submit a basic hello-world job and locate the output file it creates.',
         active: true
      },
      {
         _id: id(),
         title: 'Storage Scout',
         description: 'Check how much home-directory space remains.',
         active: true
      },
      {
         _id: id(),
         title: 'Scratch Explorer',
         description:
            'Create a small temporary file in scratch, confirm it exists, then remove it.',
         active: true
      },
      {
         _id: id(),
         title: 'File Finder',
         description: 'Use find to locate a file or directory in your home directory.',
         active: true
      },
      {
         _id: id(),
         title: 'Disk Check',
         description: 'Identify which filesystem has the most available space.',
         active: true
      },
      {
         _id: id(),
         title: 'Permission Inspector',
         description: 'Inspect a files permissions and identify who can read or write it.',
         active: true
      },
      {
         _id: id(),
         title: 'GPU Scout',
         description: 'Identify which partition provides GPU resources.',
         active: true
      },
      {
         _id: id(),
         title: 'Process Watcher',
         description: 'Inspect the processes currently running under your account.',
         active: true
      },
      {
         _id: id(),
         title: 'Log Reader',
         description:
            'Create a small text file with a few lines, then use tail to display its final two lines.',
         active: true
      },
      {
         _id: id(),
         title: 'Search Specialist',
         description:
            'Use grep to search for a word, warning, or error message inside a text file.',
         active: true
      },
      {
         _id: id(),
         title: 'Command Recall',
         description:
            'Pick one command used during todays health check and explain what information it gives you.',
         active: true
      }
   ];

   await bonusChallengeCol.insertMany(bonusChallenges);

   // -----------------------------
   // INSTRUCTION TEMPLATES (shared pattern)
   // 6 per cluster = 30 total
   // -----------------------------
   const templateSet = [
      {
         title: 'Health Check',
         time: '2-3 mins',
         description: 'Verify system health and responsiveness.',
         good: 'System responds normally.',
         bad: 'Latency, errors, or downtime detected.'
      },
      {
         title: 'Load Verification',
         time: '3-4 mins',
         description: 'Check system behaviour under typical load.',
         good: 'Stable performance under load.',
         bad: 'Degradation or throttling observed.'
      },
      {
         title: 'Resource Audit',
         time: '3-5 mins',
         description: 'Inspect resource usage and availability.',
         good: 'Resources within expected thresholds.',
         bad: 'Overutilisation or missing resources.'
      },
      {
         title: 'Failure Simulation',
         time: '4-5 mins',
         description: 'Simulate faults and verify recovery.',
         good: 'System recovers cleanly.',
         bad: 'Failure propagation or stuck states.'
      },
      {
         title: 'Performance Test',
         time: '5-6 mins',
         description: 'Measure throughput and latency.',
         good: 'Performance meets baseline.',
         bad: 'Slow or inconsistent performance.'
      },
      {
         title: 'Final Validation',
         time: '2 mins',
         description: 'Confirm system readiness.',
         good: 'All checks pass.',
         bad: 'Issues remain unresolved.'
      }
   ];

   // -----------------------------
   // INSTRUCTIONS + METHODS
   // -----------------------------
   const allInstructions = [];
   const allMethods = [];

   const clusterMap = {
      'Compute Stability': [
         'CPU Node Check',
         'Scheduler Health',
         'Job Execution',
         'Node Failure Recovery',
         'Benchmark Run',
         'System Wrap-up'
      ],
      'Storage Integrity': [
         'Filesystem Check',
         'Quota Validation',
         'IO Performance',
         'Metadata Stress',
         'Disk Health',
         'Cleanup Validation'
      ],
      'Inference Reliability': [
         'API Health',
         'Model Latency',
         'GPU Availability',
         'Request Consistency',
         'Error Rate Check',
         'Service Wrap-up'
      ],
      'Training Pipeline': [
         'Pipeline Start',
         'Dataset Validation',
         'Training Stability',
         'Checkpointing',
         'GPU Utilisation',
         'Completion Review'
      ],
      'Network & Services': [
         'Network Latency',
         'Service Discovery',
         'DNS Health',
         'External API Check',
         'Firewall Rules',
         'Final Check'
      ]
   };

   for (const cluster of clusters) {
      const titles = clusterMap[cluster.name];

      const instructions = makeInstructions(
         cluster._id,
         cluster.name,
         templateSet.map((t, i) => ({
            ...t,
            title: titles[i]
         }))
      );

      allInstructions.push(...instructions);

      for (const inst of instructions) {
         allMethods.push(
            ...makeMethods(inst._id, [
               `Run primary diagnostic for: ${inst.title}`,
               `Validate expected behaviour for ${inst.clusterId}`,
               `Log system response and timing metrics`
            ])
         );
      }
   }

   await instructionCol.insertMany(allInstructions);
   await methodCol.insertMany(allMethods);

   console.log('✅ Fresh seed data generated (no reports, no schedules)');
};
