"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

// const steps = [
//   {
//     id: 1,
//     title: "Step 1",
//     description: "Verify quota system works AND test real user filesystem experience.",
//     methods: [
//       { type: "text", content: "Run: quota -s" },
//       { type: "text", content: "Run: df -h ~" },
//       {
//         type: "code",
//         content:
//           "time dd if=/dev/zero of=~/fs-test-file bs=1M count=5000 conv=fdatasync && rm -f ~/fs-test-file\n\n" +
//           "time (mkdir -p ~/fs-test-meta && for i in {1..1000}; do touch ~/fs-test-meta/file$i; done && rm -rf ~/fs-test-meta)",
//       },
//       {
//         type: "text",
//         content: "Check filesystem performance is acceptable and quota updates correctly.",
//       },
//     ],
//   },
//   {
//     id: 2,
//     title: "Step 2",
//     description: "Description of Step 2 of the process.",
//     methods: [
//       { type: "text", content: "Alternative Method A" },
//       { type: "text", content: "Alternative Method B" },
//     ],
//   },
//   {
//     id: 3,
//     title: "Step 3",
//     description: "Description of Step 3 of the process.",
//     methods: [
//       { type: "text", content: "Alternative Method A" },
//       { type: "text", content: "Alternative Method B" },
//     ],
//   },
//   {
//     id: 4,
//     title: "Step 4",
//     description: "Description of Step 4 of the process.",
//     methods: [
//       { type: "text", content: "Alternative Method A" },
//       { type: "text", content: "Alternative Method B" },
//     ],
//   },
// ];

// const names = ["Oscar", "Calum", "Alex"]



export default function Wizard() {
  const [completedSteps, setCompletedSteps] = useState({});
  const [selectedName, setSelectedName] = useState("");
  const [selectedCluster, setSelectedCluster] = useState("");
  const [allClusters, setAllClusters] = useState([])
  const [steps, setSteps] = useState([])
  const [allNames, setAllNames] = useState([])
  const [startTime, setStartTime] = useState(null);

  
  
  useEffect(() => {
    if (selectedName && selectedCluster && !startTime) {
      setStartTime(Date.now());
    }
  }, [selectedName, selectedCluster, startTime]);





 useEffect(() => {

    async function getNames() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/people`
        );

        const data = await res.json();

        console.log("Fetched names:", data.body);

        setAllNames(data.body);

        
      } catch (error) {
        console.error("Failed to fetch names:", error);
      }
    }

    getNames();
  }, []);



 const names = allNames.map((person) => person.name);

 const nameID = allNames.find(
  (person) => person.name === selectedName
)?.id;






useEffect(() => {

    async function getAllClusters() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/hpc`
        );

        const data = await res.json();

        console.log("Fetched clusters:", data.body);

        setAllClusters(data.body);

        
      } catch (error) {
        console.error("Failed to fetch clusters:", error);
      }
    }

    getAllClusters();
  }, []);

  useEffect(() => {
    console.log("Clusters state updated:", allClusters);
  }, [allClusters]);





  useEffect(() => {
    console.log("Clusters state updated:", allClusters);
  }, [allClusters]);


const clusters = allClusters.map((cluster) => cluster.name);

const clusterId = allClusters.find(
  (cluster) => cluster.name === selectedCluster
)?.id;



useEffect(() => {
    if (!clusterId) return;
    async function getSteps() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/instructions/all/${clusterId}`
        );

        const data = await res.json();

        console.log("Fetched methods:", data.body);

        setSteps(data.body);

        
      } catch (error) {
        console.error("Failed to load methods:", error);
      }
    }

    getSteps();
  }, [clusterId]);




  function toggleStep(stepId) {
    setCompletedSteps((previous) => ({
      ...previous,
      [stepId]: !previous[stepId],
    }));
  }




  // function handleSubmit(event) {
  //   event.preventDefault();

  //   const formData = new FormData(event.currentTarget);
  //   const data = Object.fromEntries(formData.entries());

  //   console.log({
  //     ...data,
  //     completedSteps,
  //   });
  // }





  async function handleSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);

  for (const step of steps) {
  const passed = Boolean(completedSteps[step.id]);

  if (!passed) {
    const failureReason = formData
      .get(`step${step.id}FailureReason`)
      ?.toString()
      .trim();

    if (!failureReason) {
      alert(`Please provide a failure reason for ${step.title}`);
      return;
    }
  }
}

  const payload = {
    cluster: selectedCluster,
    clusterId: clusterId,
    person: selectedName,
    personId: nameID,
    startTime: startTime,
    endTime: Date.now(),
    results: steps.map((step) => {
      const passed = Boolean(completedSteps[step.id]);

      const note = passed
        ? formData.get(`step${step.id}Notes`)
        : formData.get(`step${step.id}FailureReason`);

      return {
        instructionId: step.id,
        passed: passed,
        note: String(note || ""),
      };
    }),
  };

  console.log("Payload:", payload);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/report/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await res.json();

    if (!res.ok) {
      throw new Error(responseData.message || "Failed to submit results");
    }

    console.log("Submitted successfully:", responseData);
  } catch (error) {
    console.error("Submit error:", error);
  }
}








  return (
    <section className="min-h-screen bg-slate-100 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="mb-8 text-3xl font-bold text-slate-900">
            Process Documentation Form
          </h1>

          <div className="mb-6">
            <label htmlFor="userName" className="mb-2 block text-sm font-medium text-slate-700">
              Select Name
            </label>

            <select
              id="userName"
              name="userName"
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option className="text-slate-700" value="">-- Select Name --</option>
              {/* <option value="Oscar">Oscar</option>
              <option value="Calum">Calum</option>
              <option value="Alex">Alex</option> */}
              {names.map((name) => {
                return <option key={name} value={name}>{name}</option>

              })};
            </select>
          </div>

          <div className="mb-8">
            <label htmlFor="cluster" className="mb-2 block text-sm font-medium text-slate-700">
              Select Cluster
            </label>

            <select
              id="cluster"
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}

              name="cluster"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option className="text-slate-700" value="">-- Select Cluster --</option>

              {clusters.map((cluster) => {
                return <option className="text-slate-700" key={cluster} value={cluster}>{cluster}</option>
              })}

              {console.log(clusterId)}

              {console.log(steps)}
       
            </select>
          </div>


          {selectedName && selectedCluster && (

          <div className="space-y-6">
            {steps.map((step) => {
              const isCompleted = Boolean(completedSteps[step.id]);

              return (
                <section key={step.id} className="rounded-xl border border-slate-200 bg-white p-6">
                  <h2 className="mb-4 text-xl font-semibold text-slate-900">
                    {step.title}
                  </h2>

                  <p className="mb-4 text-slate-700">{step.description}</p>

                  <details className="mb-4 rounded-lg bg-slate-50 p-4">
                    <summary className="cursor-pointer font-medium text-slate-800">
                      View Ways to Perform {step.title}
                    </summary>

                    <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
                      {step.methods.map((method, index) => (
                        <li key={index}>
      {method.content.includes(":") ? (
        <>
          <p>{method.content.split(":")[0]}:</p>
          <pre className="mt-2 overflow-auto rounded bg-slate-900 p-3 text-sm text-green-400">
            <code>{method.content.split(":").slice(1).join(":").trim()}</code>
          </pre>
        </>
      ) : (
        method.content
      )}
    </li>
                        // <li key={index}>
                        //   {method.type === "code" ? (
                        //     <pre className="mt-2 overflow-auto rounded bg-slate-900 p-3 text-sm text-green-400">
                        //       <code>{method.content}</code>
                        //     </pre>
                        //   ) : (
                        //     method.content
                        //   )}
                        // </li>
                      ))}
                    </ul>
                  </details>

               

                  {/* <label htmlFor={`step${step.id}AdditionalMethod`} className="mb-2 block text-sm font-medium text-slate-700">
                    Add Additional Method
                  </label> */}

                  {/* <input
                    id={`step${step.id}AdditionalMethod`}
                    type="text"
                    name={`step${step.id}AdditionalMethod`}
                    className="mb-4 w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  /> */}

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">
                      Completed Successfully
                    </span>

                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        name={`step${step.id}Completed`}
                        checked={isCompleted}
                        onChange={() => toggleStep(step.id)}
                        className="peer sr-only"
                      />

                      <span className="h-7 w-14 rounded-full bg-slate-300 transition-all after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-7" />
                    </label>
                  </div>

                     {isCompleted && (
                    <>

                  <label htmlFor={`step${step.id}Notes`} className="mb-2 block mt-4 text-sm font-medium text-slate-700">
                    Notes (Optional)
                  </label>
                  

                  <textarea
                    id={`step${step.id}Notes`}
                    name={`step${step.id}Notes`}
                    rows={4}
                    className="mb-4 w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  </>

                  )}

                  {!isCompleted && (
                    <div className="mt-4">
                      <label htmlFor={`step${step.id}FailureReason`} className="mb-2 block text-sm font-medium text-red-700">
                        What went wrong?
                      </label>

                      <textarea
                        id={`step${step.id}FailureReason`}
                        rows={4}
                        name={`step${step.id}FailureReason`}
                        placeholder="Describe the issue"
                        className="w-full rounded-lg border border-red-300 bg-red-50 p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                  
                    </div>
                  )}
                </section>
              );
            })}
          </div> )}

          <button
            type="submit"
            className="mt-8 rounded-lg cursor-pointer bg-blue-600 px-8 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  );
}