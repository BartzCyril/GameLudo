# Graph Report - LesPetitsChevaux  (2026-11-04)

## Corpus Check
- Corpus is ~9,607 words - fits in a single context window. You may not need a graph.

## Summary
- 346 nodes · 613 edges · 27 communities (21 shown, 6 thin omitted)
- Extraction: 94% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 33 edges (avg confidence: 0.88)
- Token cost: 641,293 input · 0 output

## Community Hubs (Navigation)
- Board UI and Player Icons
- npm Dependencies
- Game Logic and Bot
- Game Rules and History
- CI Build and Deploy Jobs
- TypeScript Config
- Blog and Posts
- App Shell and Toasts
- Dice, Turns and Errors
- GitHub Pages Workflow
- Piece Color Enum
- Stable Enum
- Banner Imagery
- Blue Robot Icon
- ESLint Config
- Logo Artwork
- Next.js Config
- Favicon Horse Glyph
- Blue Person Icon
- Green Person Icon
- Green Robot Icon
- Red Robot Icon
- Yellow Robot Icon
- Player Scores Type
- Human vs AI Concept

## God Nodes (most connected - your core abstractions)
1. `PlayerColor` - 23 edges
2. `compilerOptions` - 18 edges
3. `ErrorMessage` - 16 edges
4. `react` - 13 edges
5. `GameBoard()` - 12 edges
6. `moveForwardPieceBot()` - 12 edges
7. `checkIfPlayerClickedOnIncorrectPiece()` - 11 edges
8. `next` - 10 edges
9. `switchPlayer()` - 9 edges
10. `home()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Game()` --references--> `Yellow Human Player Icon (person-yellow.svg)`  [INFERRED]
  src/components/Game.tsx → public/img/person-yellow.svg
- `PreGameBoard` --references--> `Play Icon (white circled play button SVG)`  [INFERRED]
  src/components/PreGameBoard.tsx → public/img/play.svg
- `Turn()` --references--> `Yellow Human Player Icon (person-yellow.svg)`  [INFERRED]
  src/components/Turn.tsx → public/img/person-yellow.svg
- `PieceGame()` --references--> `Yellow Human Player Icon (person-yellow.svg)`  [INFERRED]
  src/components/PieceGame.tsx → public/img/person-yellow.svg
- `Cell()` --references--> `Yellow Human Player Icon (person-yellow.svg)`  [INFERRED]
  src/components/PreGameBoard.tsx → public/img/person-yellow.svg

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Leviers SEO du site** — readme_metadata_optimization, readme_sitemap, readme_ssr_static_generation, readme_google_search_console [EXTRACTED 1.00]
- **Cycle de regles d'une partie (debut, cours, fin)** — posts_startrules_start_rules, posts_gameplayrules_gameplay_rules, posts_endrules_end_rules [INFERRED 0.95]
- **Familles de strategies du jeu** — posts_strategiesdefensive_defensive_strategies, posts_strategiesoffensive_offensive_strategies, posts_strategiesobservationandadaptation_observation_strategies [INFERRED 0.95]
- **Human vs AI board game composition** — banner_ai_robot_players, banner_human_players, banner_board_track, banner_human_vs_ai_concept [INFERRED 0.85]

## Communities (27 total, 6 thin omitted)

### Community 0 - "Board UI and Player Icons"
Cohesion: 0.06
Nodes (49): Human Player Avatar, Red Player Person Icon, SVG Repo, Yellow Human Player Icon (person-yellow.svg), SVG Repo (icon source), Play Icon (white circled play button SVG), next, react (+41 more)

### Community 1 - "npm Dependencies"
Cohesion: 0.07
Nodes (41): dependencies, autoprefixer@10.4.14, eslint@8.40.0, eslint-config-next@13.4.1, framer-motion@^10.12.18, @heroicons/react@^2.0.18, html-react-parser@^3.0.16, markdown-to-jsx@^7.2.0 (+33 more)

### Community 2 - "Game Logic and Bot"
Cohesion: 0.13
Nodes (31): eatPiece(), forwardPiece(), getPieceNotOut(), getPieceOut(), moveForwardPieceBot(), outPiece(), canRetryRollDice(), getPieceOut() (+23 more)

### Community 3 - "Game Rules and History"
Cohesion: 0.07
Nodes (23): Regles en fin de partie, Regles en cours de partie, Chemin en spirale, Inde ancienne, Plateau traditionnel en forme de croix, Versions commerciales europeennes (Angleterre, debut 1900), Histoire du jeu des petits chevaux, Versions informatisees et en ligne (+15 more)

### Community 4 - "CI Build and Deploy Jobs"
Cohesion: 0.10
Nodes (22): runs-on, steps, environment, needs, runs-on, steps, name, url (+14 more)

### Community 5 - "TypeScript Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, downlevelIteration, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules, jsx (+12 more)

### Community 6 - "Blog and Posts"
Cohesion: 0.20
Nodes (11): gray-matter@^4.0.3, Author Avatar Photo (Cyril Bartz), gray-matter, BlogPage(), generateStaticParams(), getPostContent(), PostPage(), Button (+3 more)

### Community 7 - "App Shell and Toasts"
Cohesion: 0.18
Nodes (13): Page(), Game(), ProgressGame(), Summary(), Props, Toast(), defaultPush(), defaultValue (+5 more)

### Community 8 - "Dice, Turns and Errors"
Cohesion: 0.16
Nodes (14): Dice(), DiceProps, getIndexColor(), Turn(), TurnProps, ErrorMessage, CANNOT_REROLL, CLEAR_START_CELL_FIRST (+6 more)

### Community 9 - "GitHub Pages Workflow"
Cohesion: 0.15
Nodes (12): concurrency, cancel-in-progress, group, name, permissions, contents, id-token, pages (+4 more)

### Community 10 - "Piece Color Enum"
Cohesion: 0.40
Nodes (5): PieceGameColor, BLUE, GREEN, RED, YELLOW

### Community 11 - "Stable Enum"
Cohesion: 0.40
Nodes (5): Stable, BLUE, GREEN, RED, YELLOW

### Community 12 - "Banner Imagery"
Cohesion: 0.83
Nodes (4): AI Robot Players (cyan 2x2 stable), Central Board Track (2x3 squares, one cyan occupied), Human Players (pink 2x2 stable), Les Petits Chevaux Banner

### Community 13 - "Blue Robot Icon"
Cohesion: 0.50
Nodes (4): Blue Robot Player Representation, Blue Robot Icon, robot-rect Body (light blue #BCF4F5), SVG Repo

### Community 15 - "Logo Artwork"
Cohesion: 0.67
Nodes (3): Horse Head / Chess Knight Icon, Les Petits Chevaux Logo (black chess knight horse head silhouette on a pedestal), SVG Repo (icon source)

### Community 17 - "Favicon Horse Glyph"
Cohesion: 0.67
Nodes (3): Horse Head Icon (site favicon), Les Petits Chevaux horse branding, si-glyph-horse glyph (SVG Repo)

### Community 18 - "Blue Person Icon"
Cohesion: 0.67
Nodes (3): Blue Person Icon (light-blue head-and-shoulders silhouette, 64x64 viewBox, rendered 20px, fill #BCF4F5), Blue Player Avatar, SVG Repo (icon source)

### Community 19 - "Green Person Icon"
Cohesion: 0.67
Nodes (3): Green Human Player Icon (person-green.svg), Human Player Avatar (head and shoulders silhouette, mint green #B4EBCA), SVG Repo (icon source)

### Community 20 - "Green Robot Icon"
Cohesion: 0.67
Nodes (3): Green Robot Icon (robot-green.svg), #robot-rect body element (fill #B4EBCA), SVG Repo (icon source)

### Community 21 - "Red Robot Icon"
Cohesion: 0.67
Nodes (3): Red Robot Player Icon, robot-rect Body Element (#FFB7C3 fill), SVG Repo

### Community 22 - "Yellow Robot Icon"
Cohesion: 0.67
Nodes (3): Yellow Robot Icon, robot-rect (yellow #F7F08B body), SVG Repo

## Ambiguous Edges - Review These
- `Capture d'un pion adverse` → `Bloquer les pions adverses`  [AMBIGUOUS]
  posts/StrategiesDefensive.md · relation: conceptually_related_to
- `Chemin en spirale` → `Plateau traditionnel en forme de croix`  [AMBIGUOUS]
  posts/History.md · relation: conceptually_related_to
- `Trois lancers de de jusqu'au premier 6` → `Le plus grand nombre commence`  [AMBIGUOUS]
  posts/StartRules.md · relation: conceptually_related_to

## Knowledge Gaps
- **61 isolated node(s):** `next/core-web-vitals`, `MOVE_PIECE_FIRST`, `ROLL_SIX_TO_RELEASE`, `CLEAR_START_CELL_FIRST`, `RELEASE_PIECE_FIRST` (+56 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 136 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Board UI and Player Icons` to `Dice, Turns and Errors`, `npm Dependencies`, `Blog and Posts`, `App Shell and Toasts`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **What connects `next/core-web-vitals`, `MOVE_PIECE_FIRST`, `ROLL_SIX_TO_RELEASE` to the rest of the system?**
  _61 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Board UI and Player Icons` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Board UI and Player Icons` to `Dice, Turns and Errors`, `npm Dependencies`, `Blog and Posts`, `App Shell and Toasts`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `npm Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06504065040650407 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Capture d'un pion adverse` and `Bloquer les pions adverses`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Chemin en spirale` and `Plateau traditionnel en forme de croix`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._