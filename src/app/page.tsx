import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


export default function Home() {
  return (
    <div>
      <Button variant="primary">
          button
      </Button>
      <br />
      <Button variant="destructive">
          button
      </Button><br />
      <Button variant="ghost">
          button
      </Button><br />
      <Button variant="muted">
          button
      </Button><br />
      <Button variant="outline">
          button
      </Button><br />
      <Button variant="secondary">
          button
      </Button><br />
      <Button variant="tertiary">
          button
      </Button>

      <Input />
      
    </div>
  );
}
