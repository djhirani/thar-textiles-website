import { ButtonLink, Container } from "@/components/primitives";

export default function NotFound() {
  return (
    <main className="not-found">
      <Container>
        <p className="eyebrow">404 — Thread lost</p>
        <h1>This page has moved beyond the dunes.</h1>
        <p>Return to the current Thar Textiles homepage.</p>
        <ButtonLink href="/">Return home</ButtonLink>
      </Container>
    </main>
  );
}
