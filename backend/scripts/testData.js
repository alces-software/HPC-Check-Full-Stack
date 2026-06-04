const { ObjectId } = require("mongodb");


module.exports.seedData = async (db) => {
  const peopleCollection = db.collection("person");
  const clustersCollection = db.collection("cluster");
  const instructionsCollection = db.collection("instruction");
  const methodsCollection = db.collection("method");

  // Optional: clear existing test data
  await Promise.all([
    peopleCollection.deleteMany({}),
    clustersCollection.deleteMany({}),
    instructionsCollection.deleteMany({}),
    methodsCollection.deleteMany({}),
  ]);

  // People
  const people = [
    { _id: new ObjectId(), name: "Oscar" },
    { _id: new ObjectId(), name: "Alex" },
    { _id: new ObjectId(), name: "Calum" },
  ];

  await peopleCollection.insertMany(people);

  // Clusters
  const clusters = [
    { _id: new ObjectId(), name: "Banana Research" },
    { _id: new ObjectId(), name: "Department of Questionable Ideas" },
  ];

  await clustersCollection.insertMany(clusters);

  const instructions = [
    // Cluster 1
    {
      _id: new ObjectId(),
      title: "Measure Banana Aerodynamics",
      expectedTime: "5 mins",
      description:
        "Determine whether a banana becomes more efficient when given encouraging words.",
      clusterId: clusters[0]._id.toString(),
      good: "Banana travels with confidence.",
      bad: "Banana refuses to participate.",
    },
    {
      _id: new ObjectId(),
      title: "Emergency Duck Census",
      expectedTime: "8 mins",
      description:
        "Count all visible ducks and estimate how many are undercover agents.",
      clusterId: clusters[0]._id.toString(),
      good: "Most ducks appear honest.",
      bad: "Too many ducks know your name.",
    },
    {
      _id: new ObjectId(),
      title: "Keyboard Crumb Analysis",
      expectedTime: "6 mins",
      description:
        "Investigate the ecosystem beneath a frequently used keyboard.",
      clusterId: clusters[0]._id.toString(),
      good: "Only harmless cracker fragments found.",
      bad: "New civilization discovered.",
    },

    // Cluster 2
    {
      _id: new ObjectId(),
      title: "Coffee Temperature Diplomacy",
      expectedTime: "4 mins",
      description:
        "Negotiate a peace treaty between hot coffee and impatient humans.",
      clusterId: clusters[1]._id.toString(),
      good: "Coffee reaches agreeable temperature.",
      bad: "Tongue regrets decision.",
    },
    {
      _id: new ObjectId(),
      title: "Chair Stability Olympics",
      expectedTime: "7 mins",
      description:
        "Evaluate office chairs for balance, squeakiness, and dramatic flair.",
      clusterId: clusters[1]._id.toString(),
      good: "Chair remains loyal.",
      bad: "Chair develops trust issues.",
    },
    {
      _id: new ObjectId(),
      title: "Suspiciously Intelligent Toaster Audit",
      expectedTime: "9 mins",
      description:
        "Verify toaster is producing toast and not plotting expansion.",
      clusterId: clusters[1]._id.toString(),
      good: "Only toast detected.",
      bad: "Toaster requests admin privileges.",
    },
    {
      _id: new ObjectId(),
      title: "Rubber Duck Code Review",
      expectedTime: "5 mins",
      description:
        "Explain a bug to a rubber duck and record the duck's reaction.",
      clusterId: clusters[1]._id.toString(),
      good: "Bug identified.",
      bad: "Duck appears disappointed.",
    },
  ];

  await instructionsCollection.insertMany(instructions);

  const methods = [];

  const addMethods = (instructionId, methodTexts) => {
    methodTexts.forEach((content) => {
      methods.push({
        _id: new ObjectId(),
        content,
        instructionId: instructionId.toString(),
      });
    });
  };

  addMethods(instructions[0]._id, [
    "Throw banana gently across room.",
    "Repeat after complimenting banana.",
    "Compare flight paths and document confidence levels.",
  ]);

  addMethods(instructions[1]._id, [
    "Count visible ducks.",
    "Ask each duck a harmless question.",
    "Flag any duck that answers too quickly.",
  ]);

  addMethods(instructions[2]._id, [
    "Turn keyboard upside down.",
    "Collect crumbs on a sheet of paper.",
    "Classify findings by snack category.",
  ]);

  addMethods(instructions[3]._id, [
    "Pour coffee into mug.",
    "Wait 60 seconds.",
    "Attempt cautious sip and record outcome.",
  ]);

  addMethods(instructions[4]._id, [
    "Sit carefully.",
    "Rotate chair three times.",
    "Listen for concerning noises.",
  ]);

  addMethods(instructions[5]._id, [
    "Inspect toaster exterior.",
    "Produce one test toast.",
    "Confirm toaster does not ask philosophical questions.",
  ]);

  addMethods(instructions[6]._id, [
    "Explain bug to rubber duck.",
    "Pause dramatically.",
    "Write down any revelations.",
  ]);

  await methodsCollection.insertMany(methods);

  console.log("✅ Test data seeded");
}