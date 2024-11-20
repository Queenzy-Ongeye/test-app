import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "./components/ui-components";

export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a test card content.</p>
        </CardContent>
        <Button variant="default" size="lg" className="mt-4">
          Click Me
        </Button>
      </Card>
    </div>
  );
}
