import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="container relative">
      <section className="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
        <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
          Generate Amazing Social Content
          <span className="block text-primary">with AI Power</span>
        </h1>
        <span className="max-w-[750px] text-center text-lg font-light text-foreground">
          Create engaging social media content in minutes. Our AI-powered platform helps you 
          generate posts, captions, and visuals that resonate with your audience.
        </span>
        <div className="flex flex-col gap-4 sm:flex-row mt-6">
          <Button asChild size="lg" className="rounded-full">
            <Link href="/register">Get Started Free</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </section>

      <section className="border-t py-8 md:py-12 lg:py-24">
        <div className="container mx-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Smart Content Generation</CardTitle>
                <CardDescription>
                  AI-powered content creation tailored to your brand voice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generate engaging posts, captions, and hashtags that match your brand&apos;s 
                  unique style and audience preferences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Multi-Platform Support</CardTitle>
                <CardDescription>
                  Create content for all major social platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Optimize your content for Twitter, LinkedIn, Instagram, Facebook, 
                  TikTok, and more with platform-specific formatting.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Calendar</CardTitle>
                <CardDescription>
                  Plan and schedule your content strategy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Organize your content pipeline with our intuitive calendar and 
                  scheduling tools for consistent posting.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}