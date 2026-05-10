import { notFound } from "next/navigation";
import ObsSourceClient from "../../../components/obs/ObsSourceClient";
import { isObsSource } from "../../../lib/obs-sources";

export const dynamic = "force-dynamic";

export default async function ObsPage({
  params,
}: {
  params: Promise<{ source: string }>;
}) {
  const { source } = await params;
  if (!isObsSource(source)) notFound();

  return <ObsSourceClient source={source} />;
}
