import { getCurrentLiveData } from "../../../../db/live-data-repository";
import {
  dateKeyFromSearchParams,
  localeFromSearchParams,
} from "../../../../lib/live-data-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = localeFromSearchParams(url.searchParams);
  const dateKey = dateKeyFromSearchParams(url.searchParams);

  return Response.json(await getCurrentLiveData(locale, dateKey));
}
