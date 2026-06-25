import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { VideoEmbed } from "../components/VideoEmbed";

type ResourceType = "VIDEO" | "LINK" | "DOCUMENT" | "NOTE";

interface ModuleResource {
  id: string;
  title: string;
  type: ResourceType;
  url?: string | null;
  content?: string | null;
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
  shortDescription?: string | null;
  resources: ModuleResource[];
  quiz?: ModuleQuizMeta | null;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isResourceType = (value: unknown): value is ResourceType =>
  value === "VIDEO" || value === "LINK" || value === "DOCUMENT" || value === "NOTE";

const isModuleDetailData = (value: unknown): value is ModuleDetailData => {
  console.log("Validating module detail data:", value);
  if (!isObject(value)) {
    console.error("isModuleDetailData: value is not an object");
    return false;
  }
  if (!Array.isArray(value.resources)) {
    console.error("isModuleDetailData: value.resources is not an array");
    return false;
  }

  const baseValid =
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string";

  if (!baseValid) {
    console.error("isModuleDetailData: base fields (id, title, description) invalid", {
      id: typeof value.id,
      title: typeof value.title,
      description: typeof value.description
    });
    return false;
  }

  if (
    value.shortDescription !== undefined &&
    value.shortDescription !== null &&
    typeof value.shortDescription !== "string"
  ) {
    console.error("isModuleDetailData: shortDescription invalid", typeof value.shortDescription);
    return false;
  }

  const resourcesValid = value.resources.every((resource, index) => {
    if (!isObject(resource)) {
      console.error(`isModuleDetailData: resource[${index}] is not an object`);
      return false;
    }

    const shapeValid =
      typeof resource.id === "string" &&
      typeof resource.title === "string" &&
      isResourceType(resource.type);

    if (!shapeValid) {
      console.error(`isModuleDetailData: resource[${index}] shape invalid`, {
        id: typeof resource.id,
        title: typeof resource.title,
        type: resource.type,
        isResourceType: isResourceType(resource.type)
      });
      return false;
    }

    if (
      resource.url !== undefined &&
      resource.url !== null &&
      typeof resource.url !== "string"
    ) {
      console.error(`isModuleDetailData: resource[${index}].url invalid`, typeof resource.url);
      return false;
    }

    if (
      resource.content !== undefined &&
      resource.content !== null &&
      typeof resource.content !== "string"
    ) {
      console.error(`isModuleDetailData: resource[${index}].content invalid`, typeof resource.content);
      return false;
    }

    return true;
  });

  if (!resourcesValid) {
    return false;
  }

  if (value.quiz === undefined || value.quiz === null) {
    return true;
  }

  if (!isObject(value.quiz)) {
    console.error("isModuleDetailData: quiz is not an object", typeof value.quiz);
    return false;
  }

  const quizValid =
    typeof value.quiz.id === "string" &&
    typeof value.quiz.title === "string" &&
    typeof value.quiz.isPublished === "boolean";
  
  if (!quizValid) {
    console.error("isModuleDetailData: quiz fields invalid", {
      id: typeof value.quiz.id,
      title: typeof value.quiz.title,
      isPublished: typeof value.quiz.isPublished
    });
  }

  return quizValid;
};

const getResourceBadgeStyle = (type: ResourceType): string => {
  if (type === "VIDEO") {
    return "bg-red-50 text-red-600 border border-red-200 font-bold tracking-wider";
  }
  if (type === "LINK") {
    return "bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold tracking-wider";
  }
  if (type === "DOCUMENT") {
    return "bg-sky-50 text-sky-700 border border-sky-200 font-bold tracking-wider";
  }
  return "bg-[var(--ae-blue)]/10 text-[var(--ae-blue)] border border-[var(--ae-blue)]/20 font-bold tracking-wider";
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
    <div className="pt-24 px-6 min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pb-20">
      <div className="max-w-5xl mx-auto space-y-6">
        {isLoading ? (
          <div className="ae-brand-card border border-[var(--ae-border)] shadow-sm rounded-3xl p-12 text-center app-muted-text font-medium">Loading module...</div>
        ) : null}

        {!isLoading && error ? (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
            <p className="text-red-800 font-bold mb-4">{error}</p>
            <button
              type="button"
              onClick={() => void fetchModuleDetail()}
              className="px-6 py-2.5 bg-red-500 hover:bg-red-600 transition-colors rounded-xl font-bold text-white shadow-sm"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && !error && moduleDetail ? (
          <>
            <section className="auth-hero-card rounded-3xl p-8">
              <div className="auth-topline mb-6 w-24" />
              <span className="auth-section-kicker text-xs font-bold uppercase tracking-[0.24em] text-[var(--ae-blue)] mb-4">
                Learning Module
              </span>
              <h1 className="text-4xl font-black auth-gradient-text mb-4">{moduleDetail.title}</h1>
              {moduleDetail.shortDescription ? (
                <p className="app-muted-text font-bold text-lg mb-4">{moduleDetail.shortDescription}</p>
              ) : null}
              <p className="app-muted-text font-medium mb-6 leading-relaxed app-soft-surface p-5 rounded-2xl border">{moduleDetail.description}</p>

              <div className="mt-6">
                {quizTarget ? (
                  <Link
                    to={quizTarget}
                    className="inline-flex items-center px-8 py-3.5 bg-[var(--ae-plum-deep)] hover:bg-[var(--ae-plum-deep)]/90 text-white transition-all rounded-2xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 mt-2"
                  >
                    Start Quiz
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center px-8 py-3.5 app-soft-surface border app-subtle-text rounded-2xl font-bold cursor-not-allowed mt-2"
                  >
                    Quiz Not Available
                  </button>
                )}
              </div>
            </section>

            <section className="ae-brand-card border border-[var(--ae-border)] shadow-sm rounded-3xl p-8">
              <h2 className="text-2xl font-black text-[var(--text-color)] mb-6">Resources</h2>
              {moduleDetail.resources.length === 0 ? (
                <p className="app-muted-text font-medium">No resources available for this module yet.</p>
              ) : (
                <div className="space-y-4">
                  {moduleDetail.resources.map((resource) => (
                    <article key={resource.id} className="app-soft-surface border rounded-2xl p-6 overflow-hidden">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <h3 className="text-xl font-bold text-[var(--text-color)]">{resource.title}</h3>
                        <span
                          className={`text-[10px] px-3 py-1 rounded-md uppercase ${getResourceBadgeStyle(resource.type)}`}
                        >
                          {resource.type}
                        </span>
                      </div>

                      {resource.url ? (
                        resource.type === "VIDEO" ? (
                          <div className="mt-4 border border-[var(--ae-border)] rounded-xl overflow-hidden shadow-sm">
                            <VideoEmbed url={resource.url} />
                          </div>
                        ) : (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[var(--ae-blue)] font-bold underline hover:text-[var(--ae-periwinkle)] transition-colors break-all inline-block mt-2"
                          >
                            {resource.url}
                          </a>
                        )
                      ) : null}

                      {resource.content ? (
                        <p className="app-muted-text font-medium mt-4 whitespace-pre-line bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--ae-border)] shadow-sm">{resource.content}</p>
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
