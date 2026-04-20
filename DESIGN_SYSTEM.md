# Design System — GiveawayWheel

Een compact referentiedocument voor iedereen die aan de frontend werkt.

---

## Wat is verbeterd en waarom

| Probleem | Oplossing | Principe |
|----------|-----------|----------|
| `hover:bg-slate-750` deed niets (token niet gedefinieerd) | `slate-750: "#283447"` toegevoegd aan config | Token-first design |
| `cn()` loste class-conflicts niet op | `tailwind-merge` geïntegreerd | Voorspelbaar component-gedrag |
| `Button` had geen `type="button"` | Default `type="button"` + `loading` prop | Defensive defaults |
| Geen focus-indicator voor toetsenbord | `focus-visible:ring-2` op alle interactieve elementen | WCAG 2.4.7 |
| `<section>` als generieke card | `Card` gebruikt `<div>` met optionele `as` prop | Semantische HTML |
| Inline alert-patronen ×15 | `Alert` component met ARIA roles | DRY + a11y |
| Text-only loading states | `Skeleton` / `SkeletonCard` component | Perceived performance |
| Text-only empty states | Illustrated empty state met CTA | Leeg ≠ stuk |
| Geen mobiel navigatiemenu | Hamburger + slide-down panel in AppShell | Mobile-first |
| Geen `aria-expanded` op dropdowns | Toegevoegd aan taal- en mobiel menu | WCAG 4.1.2 |
| Escape sloot dropdown niet | `useEffect` keydown listener | Keyboard UX |

---

## Kleur-tokens

Gedefinieerd in `tailwind.config.ts` > `theme.extend.colors`.

```
Primair:     violet-600    #7c3aed   — CTA buttons, active nav, badges
Surface-1:   slate-900     #0f172a   — Card backgrounds
Surface-2:   slate-800     #1e293b   — Input backgrounds, secondary buttons
Surface-3:   slate-750     #283447   — Hover state van surface-2
Border:      slate-700     #334155   — Card- en input-randen
Text-hi:     white         #ffffff   — Koppen, primaire tekst
Text-mid:    slate-300     #cbd5e1   — Bodytekst, labels
Text-lo:     slate-400     #94a3b8   — Beschrijvingen, hints
Text-faint:  slate-500     #64748b   — Kickers, meta-tekst
Accent:      brand-300     #47d7ff   — Cyan highlights (chat, code)
Status-ok:   emerald-400   #34d399   — Connected
Status-warn: amber-400     #fbbf24   — Reconnecting
Status-err:  rose-400      #f87171   — Error / danger
```

---

## Typografie-schaal

```
font-display (Plus Jakarta Sans) → grote koppen, hero-titels
font-sans    (Inter)             → alles anders

Kicker:     text-[11px] font-semibold uppercase tracking-wide text-slate-500
                → gebruik .section-kicker CSS-klasse
Page title: text-2xl sm:text-3xl font-bold text-white
                → gebruik .page-title CSS-klasse
Card title: text-xl font-bold text-white
Body:       text-sm text-slate-300 leading-relaxed
Meta:       text-xs text-slate-500
Mono/code:  font-mono text-brand-300
```

---

## Border-radius-schaal

| Context | Klasse | Pixels |
|---------|--------|--------|
| Input velden | `rounded-md` | 6px |
| Buttons, badges | `rounded-lg` | 8px |
| Kaarten, panelen | `rounded-lg` | 8px |
| Grote panelen, modals | `rounded-xl` | 12px |
| Hero-kaarten, pill-CTA | `rounded-2xl` | 16px |
| Vermijd | `rounded-[20px]`, `rounded-[28px]`, `rounded-[34px]` | ad-hoc |

---

## Component-bibliotheek

### `Button`
```tsx
<Button variant="primary"   loading={false}>Opslaan</Button>
<Button variant="secondary">Annuleren</Button>
<Button variant="ghost">Sluiten</Button>
<Button variant="danger">Verwijderen</Button>
```
- Altijd `type="button"` (behalve `type="submit"` in formulieren)
- `loading` toont spinner + disabled state automatisch
- `focus-visible:ring-2 ring-violet-500` ingebouwd

### `Input`
```tsx
<Input
  label="Gebruikersnaam"
  hint="Twitch display name, hoofdlettergevoelig"
  error="Veld is verplicht"
  placeholder="bijv. Ninja"
/>
```
- `<label htmlFor>` gekoppeld automatisch via `id`
- `aria-invalid` + `aria-describedby` voor error/hint
- Error-state: rode rand + `role="alert"`

### `Card`
```tsx
<Card>…</Card>                    {/* standaard <div> */}
<Card as="section" aria-label="Winnaars">…</Card>  {/* semantisch */}
<Card as="article">…</Card>
```

### `Alert`
```tsx
<Alert variant="error"   title="Verbinding mislukt">Details hier</Alert>
<Alert variant="warning">Inactief ≥ 5 min</Alert>
<Alert variant="success">Instellingen opgeslagen</Alert>
<Alert variant="info">Tip: gebruik !spin in chat</Alert>
```
- `variant="error"` heeft `role="alert"` (immediate interrupt)
- Overige variants hebben `role="status"` (polite)

### `Badge`
```tsx
<Badge variant="violet">1.5× gewicht</Badge>
<Badge variant="emerald">Follower</Badge>
<Badge variant="amber">VIP</Badge>
<Badge variant="rose">Geblokkeerd</Badge>
<Badge variant="brand">Sub</Badge>
```
Vervangt `.pill-chip` CSS-klasse in nieuwe code.

### `Skeleton` / `SkeletonCard`
```tsx
{loading ? (
  Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
) : (
  <DataList />
)}
```
- `aria-hidden="true"` — screen readers slaan skeletons over
- Wrap in `aria-busy="true"` container voor screen reader feedback

---

## UX-principes toegepast

1. **Empty state ≠ stuk** — lege lijsten krijgen een icon, uitleg en een vervolgactie
2. **Loading = skeleton** — nooit textuele "Loading..." als er ruimte is voor een skeleton
3. **Keyboard-first** — elk interactief element heeft een zichtbare `:focus-visible` stijl
4. **Geen kleur als enige signaal** — status-indicatoren hebben altijd tekst + kleur (WCAG 1.4.1)
5. **Defensive defaults** — `type="button"` op alle niet-submit buttons
6. **Mobile-first** — mobiel navigatiemenu geïmplementeerd; geen horizontale overflow op ≤640px
7. **Aria-expanded** op alle toggleable elementen (dropdowns, mobile menu)

---

## Checklist voor toekomstige UI-wijzigingen

### Nieuwe component
- [ ] Gebruikt `cn()` (van `lib/utils`) voor className-merging
- [ ] Heeft `focus-visible:ring-2 ring-violet-500` of erft van Button/Input
- [ ] Semantisch correct HTML-element (geen `<div>` voor knoppen)
- [ ] `aria-label` aanwezig als tekst ontbreekt (icon-only)
- [ ] Loading/empty state gedefinieerd
- [ ] Werkt met `tailwind-merge` (geen conflicterende classes)

### Nieuwe pagina
- [ ] Gebruikt `<h1>` met `.page-title` class als paginatitel
- [ ] Gebruikt `.section-kicker` voor sectielabels
- [ ] Laadstatus toont `SkeletonCard` (geen tekst-spinner)
- [ ] Lege staat heeft icon + uitleg + CTA
- [ ] Mobiel layout getest op 375px
- [ ] Geen `aria-hidden` op primaire content

### Kleurgebruik
- [ ] Achtergrond: `bg-slate-900/95` voor kaarten, `bg-slate-800/60` voor geneste items
- [ ] Rand: `border-slate-700/70` standaard, `border-slate-600` bij hover
- [ ] Hover: `hover:bg-slate-750` (nu gedefinieerd in config)
- [ ] Focus: `focus-visible:ring-2 focus-visible:ring-violet-500`
- [ ] Tekst: white voor titels, slate-300 voor body, slate-400/500 voor meta

### Formulieren
- [ ] Elke `<input>` heeft een gekoppeld `<label htmlFor>`
- [ ] Error-state toont tekst boven/onder het veld (niet alleen kleur)
- [ ] Gebruik `<Input>` component in plaats van raw `<input className="field-input">`
- [ ] Submit-button heeft `type="submit"`, alle andere buttons `type="button"`
