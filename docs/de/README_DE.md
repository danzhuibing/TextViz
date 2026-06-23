<div align="center">

# TextViz

**Text einfügen. Ein schönes Infografik erhalten. KI-gestützt.**

[English](../../README.md) | [中文](../cn/README_CN.md) | Deutsch

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![React](https://img.shields.io/badge/React-18.x-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff)](https://vitejs.dev/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-22c55e)](https://danzhuibing.github.io/TextViz/)

</div>

TextViz ist ein webbasiertes KI-Infografik-Tool. Fügen Sie beliebigen Text ein — eine Zusammenfassung eines Papiers, einen technischen Vorschlag, eine Produktvorstellung — und ein KI-Agent entwirft und rendert in Echtzeit eine eigenständige HTML-Infografik. Herunterladen, teilen oder jedes Element inline bearbeiten.

> **100% clientseitig.** Ihr API-Schlüssel verlässt niemals den Browser. Kein Backend, kein Server, kein Tracking.

---

## Inhaltsverzeichnis

- [Beispiele](#beispiele)
- [Funktionen](#funktionen)
- [Funktionsweise](#funktionsweise)
- [Erste Schritte](#erste-schritte)
- [Verwendung](#verwendung)
- [Bereitstellung](#bereitstellung)
- [Projektstruktur](#projektstruktur)
- [FAQ](#faq)
- [Lizenz](#lizenz)

---

## Beispiele

TextViz wird mit drei sorgfältig erstellten Beispielen ausgeliefert, die unterschiedliche visuelle Stile und Inhaltstypen demonstrieren. Klicken Sie auf der Willkommensseite auf ein beliebiges Beispiel, um es sofort zu laden.

### 1. Papier-Abbildung — Transformer-Architektur

Eine abbildungsqualitative Grafik des Transformer-Modells, gezeichnet im Stil von *Attention Is All You Need* (Vaswani et al., 2017).

- **Stil**: Weißer Hintergrund, Serifentypografie, akademisches Abbildungslayout
- **SVG-Diagramme**: Hauptarchitektur (Encoder–Decoder), Scaled Dot-Product Attention, Multi-Head Attention
- **Details**: Residualverbindungen (gestrichelte Bögen), ×N=6-Schicht-Klammern, K/V-Cross-Attention-Pfeile, Parameterannotationen (d_model=512, h=8, d_ff=2048), drei Kerngleichungen

<p align="center"><em>Eingabe: eine Klartextbeschreibung der Transformer-Architektur → Ausgabe: eine papierstilige Abbildung mit drei verknüpften SVG-Diagrammen.</em></p>

### 2. Technischer Vorschlag — DeepFM-Empfehlungssystem

Eine geschäftsstilige Infografik für ein Empfehlungssystem, das Daten, Merkmale, Modell, Verlust und AB-Test-Ergebnisse abdeckt.

- **Stil**: Helles Geschäftsthema, Kartenrasterlayout, Indigo-Akzent
- **SVG-Diagramme**: DeepFM-Architektur (Wide + Deep), Merkmalsinteraktion (FM 1./2. Ordnung vs. DNN höhere Ordnung), Daten-Pipeline, Multi-Task-Verluststruktur, AB-Test-Balkendiagramm
- **Details**: 820M Samples / 45M Nutzer / 3.2M Artikel, BCE + Weighted MSE Multi-Task-Verlust, +4.8% CTR / +6.1% Verweildauer

<p align="center"><em>Eingabe: ein strukturierter technischer Vorschlag → Ausgabe: eine Fünf-Karten-Infografik mit fünf SVG-Diagrammen.</em></p>

### 3. Skizzen-Poster — Claude Code Produktvorstellung

Ein handgezeichnetes, Doodle-Stil Produkt-Poster, das Claude Code vorstellt, Anthropics terminalbasierten KI-Coding-Assistenten.

- **Stil**: Handgezeichnete Schriftarten (Caveat / Patrick Hand), Papierstruktur, gedrehte Karten, Doodle-Dekorationen
- **SVG-Diagramme**: Handgezeichnete Icons (Terminal, Gehirn, Bleistift, Rakete, Ordner, Schloss), KI-Coding-Workflow, dekorative Titelunterstreichung
- **Details**: 6 Kernfunktionen, 4 Anwendungsszenarien, "SHIP FAST!"-Stempel, Terminal-Mockup

<p align="center"><em>Eingabe: eine Produktfunktionsliste → Ausgabe: ein lustiges handgezeichnetes Poster mit benutzerdefinierten SVG-Illustrationen.</em></p>

---

## Funktionen

- **Text → Infografik in einem Schritt** — Text einfügen, die KI entwirft Layout, Farbe und generiert automatisch HTML/CSS
- **ReAct-Agent-Schleife** — `plan_design` → `add_tasks` → `write_section` → `render_and_review`, iteriert bis das Ergebnis die visuelle Prüfung besteht
- **VLM-visuelle Überprüfung** — Ein Vision-Language-Model macht einen Screenshot des Renders und prüft Farben, Schriftgrößen und Layout-Probleme
- **Inline-Bearbeitung** — Klicken Sie auf ein beliebiges Element auf der Vorschau-Leinwand, um Text, Stile, Position oder Größe zu bearbeiten; ziehen zum Verschieben; Größenänderungsgriffe; mit einem Klick löschen
- **SVG-Ersetzung** — Klicken Sie auf ein beliebiges SVG, um ein Bild hochzuladen und es zu ersetzen
- **Echtzeit-Streaming** — Verfolgen Sie, wie die KI denkt, plant und Code in Echtzeit schreibt
- **Export & Teilen** — Laden Sie die eigenständige HTML-Datei herunter, zoomen Sie, Vollbild, oder chatten Sie weiter zum Verfeinern
- **Null Backend** — Reine statische SPA. API-Schlüssel nur im Browser-`localStorage` gespeichert

---

## Funktionsweise

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  Benutzertext │ ──▶ │  plan_design │ ──▶ │  add_tasks  │ ──▶ │ write_section│
└─────────────┘     └──────────────┘     └─────────────┘     └──────┬───────┘
                                                                    │
                        ┌───────────────────────────────────────────┘
                        ▼
              ┌──────────────────┐    nein   ┌─────────────┐
              │ render_and_review│ ────────▶ │  edit_section │ ──▶ Schleife
              └────────┬─────────┘          └─────────────┘
                       │ ja
                       ▼
                ┌─────────────┐
                │   Fertig ✓  │
                └─────────────┘
```

1. **plan_design** — Das LLM analysiert den Eingabetext und erstellt ein Designdokument (Titel, Thema, Abschnitte, visuelle Typen)
2. **add_tasks** — Eine Aufgabenliste wird generiert und in der Benutzeroberfläche angezeigt
3. **write_section** — Das LLM schreibt HTML für jeden Abschnitt, live in das Vorschau-iframe gestreamt
4. **render_and_review** — html2canvas macht einen Screenshot, das VLM überprüft ihn, und bei Problemen wird `edit_section` aufgerufen
5. Die endgültige HTML-Datei ist eine eigenständige Datei, die Sie überall herunterladen und öffnen können

---

## Erste Schritte

```bash
# Repository klonen
git clone https://github.com/danzhuibing/TextViz.git
cd TextViz

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Öffnen Sie die in Ihrem Terminal angezeigte URL (typischerweise `http://localhost:5173`).

### Produktions-Build

```bash
npm run build      # Ausgabe in dist/
npm run preview    # Produktions-Build lokal vorschauen
```

Der Ordner `dist/` enthält reine statische HTML/JS/CSS-Dateien — überall bereitstellbar.

---

## Verwendung

1. Öffnen Sie TextViz und klicken Sie auf das **Zahnrad-Symbol** (oben rechts) zum Konfigurieren
2. Füllen Sie die **LLM**- und **VLM**-Endpunkte, API-Schlüssel und Modellnamen ein (OpenAI-kompatibles Format)
3. Fügen Sie beliebigen Text in das linke Eingabefeld ein und drücken Sie **Enter**
4. Verfolgen Sie, wie der KI-Agent auf der rechten Leinwand in Echtzeit plant, schreibt und überprüft
5. Wenn fertig, **laden Sie die HTML-Datei herunter**, Vollbild, oder klicken Sie auf ein Element zum Inline-Bearbeiten

> **Datenschutz**: Ihr API-Schlüssel wird nur in `localStorage` gespeichert und niemals an einen Server gesendet, außer an den von Ihnen konfigurierten LLM/VLM-Anbieter.

### Empfohlene Modelle

- **LLM** (Textgenerierung): `MiniMax/MiniMax-M3` (Standard) oder stärker; Claude/GPT/Gemini funktionieren alle
- **VLM** (visuelle Überprüfung): `Qwen/Qwen2.5-VL-7B-Instruct` oder ein beliebiges vision-fähiges Modell

---

## Bereitstellung

TextViz ist eine statische SPA — stellen Sie `dist/` auf einem beliebigen statischen Host bereit:

| Plattform | Befehl |
|-----------|--------|
| **GitHub Pages** | `dist/` zum `gh-pages`-Branch pushen (eine GitHub Action ist in `.github/workflows/deploy.yml` enthalten) |
| **Vercel** | `vercel --prod` |
| **Cloudflare Pages** | `wrangler pages deploy dist` |
| **Netlify** | `netlify deploy --prod --dir=dist` |
| **Tencent EdgeOne** | `edgeone makers deploy -n textviz` |

### GitHub Pages (automatisch)

Dieses Repo enthält einen GitHub Actions-Workflow, der bei jedem Push auf `main` automatisch baut und auf GitHub Pages bereitstellt. Aktivieren Sie einfach Pages in Ihren Repo-Einstellungen → Pages → Quelle: GitHub Actions.

**Live-Demo**: <https://danzhuibing.github.io/TextViz/>

---

## Projektstruktur

```
src/
├── components/           # UI-Komponenten
│   ├── ChatPanel.tsx        # Chat-Panel (links)
│   ├── ChatInput.tsx        # Eingabefeld
│   ├── PreviewCanvas.tsx    # Vorschau-Leinwand (rechts, mit Inline-Editor)
│   ├── EditPanel.tsx        # Inline-Element-Editor
│   ├── ConfigModal.tsx      # Einstellungs-Modal
│   ├── MessageBubble.tsx    # Chat-Nachrichten-Blase
│   ├── ToolCallCard.tsx     # Tool-Aufruf-Karte
│   ├── TaskList.tsx         # Aufgabenliste
│   ├── RequestLogPanel.tsx  # Anfrageprotokoll-Panel
│   ├── WritingProgress.tsx  # Schreibfortschritt
│   ├── Divider.tsx          # Größenänderbarer Trenner
│   └── OctopusLogo.tsx      # Logo
├── lib/                  # Kernlogik
│   ├── agent.ts             # ReAct-Agent-Schleife
│   ├── llm.ts               # LLM-Client
│   ├── vlm.ts               # VLM-Client
│   ├── tools.ts             # Tool-Definitionen
│   ├── editorRuntime.ts     # Inline-Editor-Laufzeit (in iframe injiziert)
│   ├── examples.ts          # Eingebaute Beispiele
│   ├── requestLog.ts        # Anfrageprotokollierung
│   └── utils.ts             # Hilfsfunktionen
├── pages/
│   └── Workspace.tsx        # Haupt-Workspace
├── store/
│   └── useStore.ts          # Zustand-Store
└── types/
    └── index.ts             # TypeScript-Typen
```

---

## FAQ

**F: Brauche ich ein Backend?**
Nein. TextViz ist 100% clientseitig. Die einzigen Netzwerkaufrufe gehen direkt von Ihrem Browser an die von Ihnen konfigurierte LLM/VLM-API.

**F: Wo wird mein API-Schlüssel gespeichert?**
Im `localStorage` Ihres Browsers. Er verlässt nie Ihren Computer, außer beim Aufruf des LLM/VLM-Anbieters.

**F: Welche LLM/VLM-Anbieter werden unterstützt?**
Jeder Anbieter mit einer OpenAI-kompatiblen API. Dazu gehören OpenAI, Anthropic (über kompatiblen Proxy), SiliconFlow, DeepSeek, Ollama, vLLM und mehr.

**F: Kann ich die generierte Infografik bearbeiten?**
Ja. Klicken Sie auf ein beliebiges Element auf der Vorschau-Leinwand, um das Bearbeitungspanel zu öffnen. Sie können Text, HTML, Farben, Schriftarten, Abstände, Position, Größe und mehr ändern. SVG-Elemente können durch hochgeladene Bilder ersetzt werden.

**F: Kann ich dies offline verwenden?**
Die App-Shell funktioniert nach dem Laden offline, aber die KI-Generierung erfordert einen LLM/VLM-API-Aufruf. Sie können ein lokales Modell über Ollama für vollständig offline Generierung ausführen.

---

## Lizenz

[MIT](../../LICENSE)

---

<div align="center">

Wenn TextViz für Sie nützlich ist, geben Sie bitte ein ⭐ — es hilft anderen, das Projekt zu entdecken.

</div>
