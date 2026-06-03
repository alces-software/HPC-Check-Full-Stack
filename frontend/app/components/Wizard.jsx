"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";





export default function Wizard() {
  const [completedSteps, setCompletedSteps] = useState({});
  const [selectedName, setSelectedName] = useState("");
  const [selectedCluster, setSelectedCluster] = useState("");
  const [allClusters, setAllClusters] = useState([])
  const [steps, setSteps] = useState([])
  const [allNames, setAllNames] = useState([])
  const [startTime, setStartTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [nameID, setNameID] = useState("");
const [cookieCluster, setCookieCluster] = useState("");
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
  setNameID(Cookies.get("selectedPersonId") || "");
  setCookieCluster(Cookies.get("currentCluster") || "");
}, []);


  const router = useRouter();


// GETS ALL NAMES
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



//  const names = allNames.map((person) => person.name);



// const nameID = Cookies.get("selectedPersonId")

 const name = allNames.find(
  (person) => person.id === nameID
)?.name;





// GETS ALL HPC CLUSTER DATA
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


// const clusters = allClusters.map((cluster) => cluster.name);

const clusterId = allClusters.find(
  (cluster) => cluster.name === cookieCluster
)?.id;

useEffect(() => {
  setStartTime(Date.now());
}, []);






// GETS STEPS AND METTHODS BASED ON CLUSTER ID
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





// AUBMITS FORM TO BACKEND
  async function handleSubmit(event) {
  event.preventDefault();

  setSubmitting(true);

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
    // cluster: selectedCluster,
    clusterId: clusterId,
    // person: selectedName,
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
    else {
      setSubmitting(false)
      Cookies.remove("selectedPersonId");
      Cookies.remove("currentCluster");
      alert("Report submitted successfully.")
      router.push('/')
    }

    console.log("Submitted successfully:", responseData);
  } catch (error) {
    console.error("Submit error:", error);
  }

  finally {
    
    setSubmitting(false)
  }
}



  return (
    <section className="min-h-screen bg-slate-100 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="mb-8 text-3xl font-bold text-slate-900">
            Process Documentation Form
          </h1>
          
          {mounted && (<h2 > {name}'s Check for {cookieCluster}</h2>)}

          {nameID && clusterId && (

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

          {/* <button
            type="submit"
            className="mt-8 rounded-lg cursor-pointer bg-blue-600 px-8 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Submit
          </button> */}

           <button
          type="submit"
          disabled={submitting}
          className={`mt-8 min-w-[140px] h-12 rounded-lg px-8 text-white font-medium transition flex items-center justify-center gap-2 ${nameID && cookieCluster ? "bg-blue-600 hover:bg-blue-700 cursor-pointer" : "bg-gray-400 cursor-not-allowed"}`}>
            
            {submitting ? (
              <>
              <span>Submitting</span>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </>
              ) : (
                "Submit"
                )}
                </button>

        
        </form>
      </div>
    </section>
  );
}