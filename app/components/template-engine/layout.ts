Ecmascript file had an error
./app/components/template-engine/theme.ts (253:17)

Ecmascript file had an error
  251 | import type { LayoutTokens, Container, Density, Radius } from "../../template-base/template.config";
  252 |
> 253 | export function containerClass(container?: Container) {
      |                 ^^^^^^^^^^^^^^
  254 |   const base = "mx-auto px-4";
  255 |   switch (container) {
  256 |     case "5xl":

the name `containerClass` is defined multiple times

Import traces:
  Client Component Browser:
    ./app/components/template-engine/theme.ts [Client Component Browser]
    ./app/components/template-engine/template-engine.tsx [Client Component Browser]
    ./app/template-base/page.tsx [Client Component Browser]
    ./app/template-base/page.tsx [Server Component]

  Client Component SSR:
    ./app/components/template-engine/theme.ts [Client Component SSR]
    ./app/components/template-engine/template-engine.tsx [Client Component SSR]
    ./app/template-base/page.tsx [Client Component SSR]
    ./app/template-base/page.tsx [Server Component]