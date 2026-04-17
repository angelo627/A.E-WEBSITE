import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

type ResourceType = "VIDEO" | "LINK" | "DOCUMENT" | "NOTE";

interface ModuleResource {
  id: string;
  title: string;
  type: ResourceType;
  url?: string;
  content?: string;
}

interface ModuleQuizMeta {
  id: string;
  title: string;
  isPublished: boolean;
}

interface ModuleDetailData {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  resources: ModuleResource[];
  quiz?: ModuleQuizMeta;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isResourceType = (value: unknown): value is ResourceType =>
  value === "VIDEO" || value === "LINK" || value === "DOCUMENT" || value === "NOTE";

const isModuleDetailData = (value: unknown): value is ModuleDetailData => {
  if (!isObject(value) || !Array.isArray(value.resources)) {
    return false;
  }

  const baseValid =
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string";

  if (!baseValid) {
    return false;
  }

  if (value.shortDescription !== undefined && typeof value.shortDescription !== "string") {
    return false;
  }

  const resourcesValid = value.resources.every((resource) => {
    if (!isObject(resource)) {
      return false;
    }

    const shapeValid =
      typeof resource.id === "string" &&
      typeof resource.title === "string" &&
      isResourceType(resource.type);

    if (!shapeValid) {
      return false;
    }

    if (resource.url !== undefined && typeof resource.url !== "string") {
      return false;
    }

    if (resource.content !== undefined && typeof resource.content !== "string") {
      return false;
    }

    return true;
  });

  if (!resourcesValid) {
    return false;
  }

  if (value.quiz === undefined) {
    return true;
  }

  if (!isObject(value.quiz)) {
    return false;
  }

  return (
    typeof value.quiz.id === "string" &&
    typeof value.quiz.title === "string" &&
    typeof value.quiz.isPublished === "boolean"
  );
};

const getResourceBadgeStyle = (type: ResourceType): string => {
  if (type === "VIDEO") {
    return "bg-red-500/15 text-red-300 border border-red-400/30";
  }
  if (type === "LINK") {
    return "bg-cyan-500/15 text-cyan-300 border border-cyan-400/30";
  }
  if (type === "DOCUMENT") {
    return "bg-sky-500/15 text-sky-300 border border-sky-400/30";
  }
  return "bg-purple-500/15 text-purple-300 border border-purple-400/30";
};

export default function ModuleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [moduleDetail, setModuleDetail] = useState<ModuleDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModuleDetail = useCallback(async () => {
    if (!id) {
      setError("Missing module identifier in URL.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/modules/${encodeURIComponent(id)}`);
      if (!isModuleDetailData(response)) {
        throw new Error("Unexpected module detail response shape.");
      }

      setModuleDetail(response);
    } catch (fetchError: unknown) {
      const message =
        fetchError instanceof Error ? fetchError.message : "Failed to load module detail.";
      setError(message);
      setModuleDetail(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchModuleDetail();
  }, [fetchModuleDetail]);

  const quizTarget = useMemo(() => {
    if (!moduleDetail?.quiz || !moduleDetail.quiz.isPublished) {
      return null;
    }
    return `/quiz/${moduleDetail.quiz.id}`;
  }, [moduleDetail]);

  return (
    <div className="pt-24 px-6 min-h-screen bg-[#050020] text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        {isLoading ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">Loading module...</div>
        ) : null}

        {!isLoading && error ? (
          <div className="bg-rose-500/10 border border-rose-400/30 rounded-2xl p-6">
            <p className="text-rose-200 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => void fetchModuleDetail()}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-400 rounded-lg font-medium"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && !error && moduleDetail ? (
          <>
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h1 className="text-3xl font-bold text-purple-300 mb-2">{moduleDetail.title}</h1>
              {moduleDetail.shortDescription ? (
                <p className="text-gray-200 mb-2">{moduleDetail.shortDescription}</p>
              ) : null}
              <p className="text-gray-300">{moduleDetail.description}</p>

              <div className="mt-6">
                {quizTarget ? (
                  <Link
                    to={quizTarget}
                    className="inline-flex items-center px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold"
                  >
                    Start Quiz
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center px-5 py-2.5 bg-gray-600/70 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Quiz Not Available
                  </button>
                )}
              </div>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-4">Resources</h2>
              {moduleDetail.resources.length === 0 ? (
                <p className="text-gray-300">No resources available for this module yet.</p>
              ) : (
                <div className="space-y-3">
                  {moduleDetail.resources.map((resource) => (
                    <article key={resource.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <h3 className="text-lg font-medium">{resource.title}</h3>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full ${getResourceBadgeStyle(resource.type)}`}
                        >
                          {resource.type}
                        </span>
                      </div>

                      {resource.url ? (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-300 underline break-all"
                        >
                          {resource.url}
                        </a>
                      ) : null}

                      {resource.content ? (
                        <p className="text-gray-200 mt-2 whitespace-pre-line">{resource.content}</p>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
