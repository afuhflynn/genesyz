import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";

interface SharedResearchPageProps {
  params: Promise<{ token: string }>;
}

export default async function SharedResearchPage({
  params,
}: SharedResearchPageProps) {
  const { token } = await params;

  const idea = await db.idea.findFirst({
    where: { shareToken: token },
    include: {
      user: {
        select: { name: true, image: true },
      },
      scores: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      researchPackets: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!idea) {
    notFound();
  }

  const score = idea.scores[0];
  const latestResearch = idea.researchPackets[0];

  return (
    <div className="container max-w-2xl mx-auto py-12 space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {score && (
                <div className="text-4xl font-bold">{score.overallScore}</div>
              )}
              <div>
                <h1 className="text-2xl font-semibold">
                  {idea.title || "Untitled Idea"}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{idea.status}</Badge>
                  {idea.researchedAt && (
                    <span className="text-sm text-muted-foreground">
                      Researched {formatDistanceToNow(idea.researchedAt)} ago
                    </span>
                  )}
                </div>
              </div>
            </div>

            {idea.summary && (
              <div>
                <h3 className="font-medium mb-2">Summary</h3>
                <p className="text-muted-foreground">{idea.summary}</p>
              </div>
            )}

            {latestResearch && (
              <div>
                <h3 className="font-medium mb-2">Research</h3>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {typeof latestResearch.content === "string"
                    ? latestResearch.content
                    : JSON.stringify(latestResearch.content).slice(0, 1000)}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Researched by {idea.user?.name || "IdeasVault user"}
              </p>
              <Button asChild className="mt-4">
                <a href="/ideas">Create Your Own Research</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
