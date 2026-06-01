"use client";

import { FormEvent, useState } from "react";

type Method = {
  type: "text" | "code";
  content: string;
};

type Step = {
  id: number;
  title: string;
  description: string;
  methods: Method[];
};

const steps: Step[] = [
  {
    id: 1,
    title: "Step 1",
    description: "Verify quota system works AND test real user filesystem experience.",
    methods: [
      {
        type: "text",
        content: "Run: quota -s",
      },
      {
        type: "text",
        content: "Run: df -h ~",
      },
      {
        type: "code",
        content:
          "time dd if=/dev/zero of=~/fs-test-file bs=1M count=5000 conv=fdatasync && rm -f ~/fs-test-file\n\n" +
          "time (mkdir -p ~/fs-test-meta && for i in {1..1000}; do touch ~/fs-test-meta/file$i; done && rm -rf ~/fs-test-meta)",
      },
      {
        type: "text",
        content: "Check filesystem performance is acceptable and quota updates correctly.",
      },
    ],
  },
  {
    id: 2,
    title: "Step 2",
    description: "Description of Step 2 of the process.",
    methods: [
      { type: "text", content: "Alternative Method A" },
      { type: "text", content: "Alternative Method B" },
    ],
  },
  {
    id: 3,
    title: "Step 3",
    description: "Description of Step 3 of the process.",
    methods: [
      { type: "text", content: "Alternative Method A" },
      { type: "text", content: "Alternative Method B" },
    ],
  },
  {
    id: 4,
    title: "Step 4",
    description: "Description of Step 4 of the process.",
    methods: [
      { type: "text", content: "Alternative Method A" },
      { type: "text", content: "Alternative Method B" },
    ],
  },
];

export default function Home() {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  function toggleStep(stepId: number) {
    setCompletedSteps((previous) => ({
      ...previous,
      [stepId]: !previous[stepId],
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    console.log({
      ...data,
      completedSteps,
    });
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="mb-8 text-3xl font-bold text-slate-900">
            Process Documentation Form
          </h1>

          <div className="mb-6">
            <label
              htmlFor="userName"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Select Name
            </label>

            <select
              id="userName"
              name="userName"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Name --</option>
              <option value="Oscar">Oscar</option>
              <option value="Calum">Calum</option>
              <option value="Alex">Alex</option>
            </select>
          </div>

          <div className="mb-8">
            <label
              htmlFor="cluster"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Select Cluster
            </label>

            <select
              id="cluster"
              name="cluster"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Cluster --</option>
              <option value="Cluster 1">Cluster 1</option>
              <option value="Cluster 2">Cluster 2</option>
              <option value="Cluster 3">Cluster 3</option>
            </select>
          </div>

          <div className="space-y-6">
            {steps.map((step) => {
              const isCompleted = Boolean(completedSteps[step.id]);

              return (
                <section
                  key={step.id}
                  className="rounded-xl border border-slate-200 bg-white p-6"
                >
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
                          {method.type === "code" ? (
                            <pre className="mt-2 overflow-auto rounded bg-slate-900 p-3 text-sm text-green-400">
                              <code>{method.content}</code>
                            </pre>
                          ) : (
                            method.content
                          )}
                        </li>
                      ))}
                    </ul>
                  </details>

                  <label
                    htmlFor={`step${step.id}Notes`}
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Notes
                  </label>

                  <textarea
                    id={`step${step.id}Notes`}
                    name={`step${step.id}Notes`}
                    rows={4}
                    className="mb-4 w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <label
                    htmlFor={`step${step.id}AdditionalMethod`}
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Add Additional Method
                  </label>

                  <input
                    id={`step${step.id}AdditionalMethod`}
                    type="text"
                    name={`step${step.id}AdditionalMethod`}
                    className="mb-4 w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

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

                  {!isCompleted && (
                    <div className="mt-4">
                      <label
                        htmlFor={`step${step.id}FailureReason`}
                        className="mb-2 block text-sm font-medium text-red-700"
                      >
                        What went wrong?
                      </label>

                      <input
                        id={`step${step.id}FailureReason`}
                        type="text"
                        name={`step${step.id}FailureReason`}
                        placeholder="Describe the issue"
                        className="w-full rounded-lg border border-red-300 bg-red-50 p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          <button
            type="submit"
            className="mt-8 rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>
    </main>
  );
}
