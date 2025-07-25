// Removed unused imports

export const runtime = "nodejs" 

const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8000"
    : "https://saju.trinity-apps.net";


// Note: no default export or deprecated config; using App Router POST handler with Web API formData
export async function POST(req: Request) {
  // only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405 }
    );
  }

  // parse incoming multipart/form-data
  const form = await req.formData();

  // reconstruct FormData for backend
  const forward = new FormData();
  // iterate over form entries without for-of (avoid downlevelIteration error)
  Array.from(form.entries()).forEach(([key, value]) => {
    if (value instanceof File) {
      forward.append(key, value, value.name);
    } else {
      forward.append(key, value as string);
    }
  });

  // call AI backend
  const response = await fetch(`${BASE_URL}/saju-reading`, {
    method: "POST",
    body: forward,
  });

  if (!response.ok) {
    return new Response(
      JSON.stringify({ error: "API 호출 실패" }),
      { status: 500 }
    );
  }

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}