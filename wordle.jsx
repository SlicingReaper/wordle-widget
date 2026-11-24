// WORDLE// — the daily five-letter word game for Übersicht, same 230 × 314 panel as NOTE//PAD.
// Install: double-click install.command in this repo (https://github.com/SlicingReaper/wordle-widget).
// No backend. Word lists: the original Wordle lists (2 315 answers + 10 657 extra allowed guesses, MIT, npm "wordle-words").
// State + stats: ~/Library/Application Support/STUDYTERM/wordle.json
//
//   Click the board, type a word, ⏎. Backspace deletes. Or click the mini keyboard.
//   EN / FR / ES / DE (amber button, top right) — each language has its own daily word, stats and keyboard
//   (FR: AZERTY, accents ignored · ES: Ñ · DE: QWERTZ with Ä Ö Ü). Lists: ~/Library/Application Support/STUDYTERM/wordle-langs.json.
//   Tiles: accent = right letter, right spot · amber = in the word, wrong spot · dark = not in the word.
//   One word per day (new at local midnight). Six tries. After the daily game: PRACTICE ▸ for unlimited random words (stats untouched).
//   Stats: TODAY (row) · LAST (yesterday's result) · STREAK · MAX streak · WIN % — plus the 1–6 guess distribution when a game ends.
//
// Fallback spot (no widgets.json entry): top 40, right 1008. Move it anywhere with WIDGET//CTL.
// Hidden while ~/Library/Application Support/STUDYTERM/hidden exists (⌃⌥⌘W toggles it).
// No JSX fragments (<>…</>): Übersicht has no global React, so they crash with "Can't find variable: React".
// Style: STUDY//TERM retro terminal (near-black navy, cyan glow, monospace, corner brackets), themed by WIDGET//CTL.

import { run } from "uebersicht";

// ── WIDGET//CTL block — theme + position, set by the WIDGET//CTL app (⌃⌥⌘S). Identical in all widgets: change them together. ──
// Reads ~/Library/Application Support/STUDYTERM/widgets.json on every refresh. No file / no entry for this widget →
// it keeps its className spot and the cyan terminal look, exactly as before. "placed": false → stored (renders nothing).
const W_ID = "wordle";
const W_CFG = `cat "$HOME/Library/Application Support/STUDYTERM/widgets.json" 2>/dev/null | tr -d '\\n\\r'`;
// schemes = colours. c accent · blue/amber/red status · dim muted · bg panel rgb · inset field rgb · text body. cycle = rainbow hue drift
const W_SCHEMES = {
  cyan:    { c: "#3ef0ff", blue: "#1f8fff", amber: "#ffb84d", red: "#ff5f6d", dim: "#5d7a99", bg: "4,9,20",      inset: "10,24,48",    text: "#cfefff" },
  amber:   { c: "#ffb000", blue: "#ff7b29", amber: "#ffe066", red: "#ff4d3d", dim: "#8f7350", bg: "16,9,2",      inset: "40,22,6",     text: "#ffe9c4" },
  matrix:  { c: "#3dff7f", blue: "#19c25e", amber: "#d8ff47", red: "#ff4f6b", dim: "#4f8a62", bg: "2,13,6",      inset: "6,32,14",     text: "#d4ffe1" },
  vapor:   { c: "#ff5ad9", blue: "#8b6dff", amber: "#ffc857", red: "#ff4f7e", dim: "#8c6fa3", bg: "15,5,25",     inset: "38,14,56",    text: "#f7deff" },
  sunset:  { c: "#ff8c5a", blue: "#ffc06b", amber: "#ffe07a", red: "#ff4f6d", dim: "#9c7a72", bg: "22,9,10",     inset: "52,20,22",    text: "#ffe7dc" },
  ice:     { c: "#eaf6ff", blue: "#8ec9ff", amber: "#ffd38f", red: "#ff8f8f", dim: "#7e90a6", bg: "12,16,24",    inset: "30,38,52",    text: "#f3f8ff" },
  gold:    { c: "#e8c15a", blue: "#c9a227", amber: "#f5dc8c", red: "#d9534f", dim: "#8a7a4f", bg: "8,8,8",       inset: "26,24,18",    text: "#f3e6c0" },
  royal:   { c: "#ffffff", blue: "#d9c8ff", amber: "#ffd479", red: "#ff8fa3", dim: "#b9a3e6", bg: "74,32,140",   inset: "98,54,170",   text: "#f4eeff" },
  marble:  { c: "#2d2a26", blue: "#5b6b7a", amber: "#a07a2c", red: "#b0413e", dim: "#8d877e", bg: "243,240,234", inset: "228,224,216", text: "#3a3631" },
  pastel:  { c: "#8a6fd1", blue: "#5f9bd6", amber: "#d69a4a", red: "#d9707f", dim: "#a59bb4", bg: "251,245,252", inset: "240,232,246", text: "#4d4560" },
  rose:    { c: "#f2b5a7", blue: "#d79a8c", amber: "#f5d0a9", red: "#e0707a", dim: "#8f7471", bg: "26,17,19",    inset: "48,32,35",    text: "#f8e4df" },
  ink:     { c: "#111111", blue: "#3a3a3a", amber: "#8a6d1f", red: "#c0392b", dim: "#8a8a8a", bg: "255,255,255", inset: "240,240,240", text: "#1a1a1a" },
  forest:  { c: "#a8d5a2", blue: "#7fb7a4", amber: "#e3c77a", red: "#e08a7a", dim: "#6f8a6a", bg: "14,26,18",    inset: "26,44,32",    text: "#e2f1df" },
  ocean:   { c: "#7fdbff", blue: "#4aa3df", amber: "#ffd27f", red: "#ff7f8f", dim: "#5f86a3", bg: "6,28,48",     inset: "14,48,76",    text: "#e2f5ff" },
  rainbow: { c: "#ff4fd8", blue: "#4fa8ff", amber: "#ffd84f", red: "#ff4f6b", dim: "#9a7fb8", bg: "12,6,22",     inset: "34,18,52",    text: "#fbeaff", cycle: true },
  vice:    { c: "#ff4fa3", blue: "#2de2e6", amber: "#ffb347", red: "#ff3f5e", dim: "#a07ab8", bg: "24,8,40",     inset: "52,16,72",    text: "#ffe6f3" },
};
// styles = finish. tex grid|scan|glass|marble|none · bw border px · hard = offset shadow · glow = neon text/edges
const W_STYLES = {
  terminal: { tex: "grid",   bin: true,  brackets: true,  radius: 0,  alpha: 0.88, blur: 22, glow: true,  edge: "55", bw: 1 },
  crt:      { tex: "scan",   bin: false, brackets: true,  radius: 4,  alpha: 0.92, blur: 16, glow: true,  edge: "77", bw: 1 },
  glass:    { tex: "glass",  bin: false, brackets: false, radius: 18, alpha: 0.5,  blur: 30, glow: true,  edge: "40", bw: 1 },
  minimal:  { tex: "none",   bin: false, brackets: false, radius: 8,  alpha: 0.95, blur: 10, glow: false, edge: "30", bw: 1 },
  marble:   { tex: "marble", bin: false, brackets: false, radius: 12, alpha: 0.97, blur: 8,  glow: false, edge: "44", bw: 1 },
  paper:    { tex: "none",   bin: false, brackets: false, radius: 14, alpha: 0.98, blur: 0,  glow: false, edge: "18", bw: 1, soft: true },
  bold:     { tex: "none",   bin: false, brackets: false, radius: 0,  alpha: 1,    blur: 0,  glow: false, edge: "",   bw: 2, hard: true },
  vice:     { tex: "vice",   bin: false, brackets: false, radius: 10, alpha: 0.9,  blur: 20, glow: true,  edge: "88", bw: 1 },
};
let C, BLUE, AMBER, RED, DIM, T;
let W_LAST = null, W_POS = { position: "relative" };
const W_RGBA = (hex, a) => { const n = parseInt(String(hex).slice(1), 16) || 0; return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
const W_INSET = () => `rgba(${T.inset},0.55)`;
const W_APPLY = (style, scheme) => {
  const st = W_STYLES[style] ? style : "terminal", sc = W_SCHEMES[scheme] ? scheme : "cyan";
  T = { ...W_STYLES[st], ...W_SCHEMES[sc], name: st };
  C = T.c; BLUE = T.blue; AMBER = T.amber; RED = T.red; DIM = T.dim;
};
W_APPLY("terminal", "cyan");
const W_LOAD = (output) => {
  const m = /CFG:(\{.*\})/.exec(output || "");
  if (m) { try { W_LAST = JSON.parse(m[1]); } catch (e) {} }
  const cfg = W_LAST || {}, g = cfg.global || {}, w = (cfg.widgets || {})[W_ID] || {};
  W_APPLY(w.style || g.style, w.scheme || g.scheme);
  const ok = typeof w.x === "number" && typeof w.y === "number";
  W_POS = ok ? { position: "fixed", left: w.x, top: w.y } : { position: "relative" };
  return { unplaced: w.placed === false };
};
const W_TEX = () => {
  if (T.tex === "grid") return `linear-gradient(${W_RGBA(C, 0.045)} 1px, transparent 1px), linear-gradient(90deg, ${W_RGBA(C, 0.045)} 1px, transparent 1px)`;
  if (T.tex === "scan") return `repeating-linear-gradient(0deg, ${W_RGBA(C, 0.07)} 0px, ${W_RGBA(C, 0.07)} 1px, transparent 1px, transparent 3px)`;
  if (T.tex === "glass") return `linear-gradient(135deg, ${W_RGBA(C, 0.12)}, transparent 55%)`;
  if (T.tex === "marble") {
    const v = W_RGBA(T.dim, 0.38), v2 = W_RGBA(T.dim, 0.2);
    return [
      `linear-gradient(118deg, transparent 31%, ${v} 31.6%, transparent 33%)`,
      `linear-gradient(152deg, transparent 58%, ${v2} 58.5%, transparent 60.5%)`,
      `linear-gradient(28deg, transparent 69%, ${v2} 69.4%, transparent 70.6%)`,
      `linear-gradient(97deg, transparent 12%, ${v2} 12.3%, transparent 13.4%)`,
      `radial-gradient(ellipse at 78% 22%, ${W_RGBA(T.text, 0.06)}, transparent 55%)`,
      `radial-gradient(ellipse at 15% 85%, ${W_RGBA(T.dim, 0.12)}, transparent 50%)`,
    ].join(", ");
  }
  if (T.tex === "vice") return [
    `radial-gradient(ellipse at 88% 118%, ${W_RGBA(T.amber, 0.42)}, transparent 58%)`,
    `radial-gradient(ellipse at 8% -12%, ${W_RGBA(C, 0.30)}, transparent 60%)`,
    `repeating-linear-gradient(0deg, ${W_RGBA(T.blue, 0.07)} 0px, ${W_RGBA(T.blue, 0.07)} 1px, transparent 1px, transparent 9px)`,
    `linear-gradient(160deg, ${W_RGBA(C, 0.10)}, ${W_RGBA(T.blue, 0.08)})`,
  ].join(", ");
  return "none";
};
// col = the widget's own frame colour (STUDY//TERM: dim at standby, amber paused). Flat styles only show
// it when it means something — standby dim would turn their solid border + hard shadow muddy, so they use the accent.
const W_PANEL = (c0) => { const col = !T.glow && c0 === DIM ? C : c0; return ({
  ...W_POS,
  background: `rgba(${T.bg},${T.alpha})`, backdropFilter: `blur(${T.blur}px)`, WebkitBackdropFilter: `blur(${T.blur}px)`,
  border: `${T.bw}px solid ${col}${T.edge}`, borderRadius: T.radius, color: T.text,
  boxShadow: T.hard ? `5px 5px 0 ${col}`
    : T.soft ? "0 10px 26px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.18)"
    : (T.glow ? `0 8px 30px rgba(0,0,0,0.45), 0 0 18px ${col}22` : "0 6px 20px rgba(0,0,0,0.35)") + (T.tex === "scan" ? ", inset 0 0 40px rgba(0,0,0,0.55)" : ""),
  backgroundImage: W_TEX(),
  backgroundSize: T.tex === "grid" ? "12px 12px" : "auto",
  animation: T.cycle ? "wctlhue 16s linear infinite" : "none",
}); };
const W_CSS = `.wctl-noglow * { text-shadow: none !important; filter: none !important; }
@keyframes wctlhue { from { filter: hue-rotate(0deg) } to { filter: hue-rotate(360deg) } }`;
// ── end WIDGET//CTL block ──

const SUP = `"$HOME/Library/Application Support/STUDYTERM"`;
const ST_F = `${SUP}/wordle.json`;                 // English state (other languages: wordle-fr.json · wordle-es.json · wordle-de.json)
const LANG_F = `${SUP}/wordle-lang`;
const DATA_F = `${SUP}/wordle-langs.json`;          // FR · ES · DE word lists (installed next to the map data)

export const command = `H="$HOME/Library/Application Support/STUDYTERM/hidden"; [ -f "$H" ] && { echo HIDDEN; exit 0; }; echo "CFG:$(${W_CFG})"; echo "ST:$(cat ${ST_F} 2>/dev/null | tr -d '\\n\\r')"; echo "LANG:$(cat ${LANG_F} 2>/dev/null)"`;

export const refreshFrequency = 2000; // 2 s — theme/position/hidden + saved state on first load

export const className = `
  top: 40px;
  right: 1008px;
  font-family: "SF Mono", Menlo, ui-monospace, monospace;
  color: #cfefff;
`;

export const initialState = { output: "", f: 0 };

export const updateState = (ev, prev) => {
  switch (ev.type) {
    case "UB/COMMAND_RAN":
      return { ...prev, output: ev.output || prev.output };
    case "FRAME":
      return { ...prev, f: ev.f };
    default:
      return prev;
  }
};

// ───────── word lists (original Wordle lists, joined 5 letters per word) ─────────
const ANSWERS = "cigarrebutsissyhumphawakeblushfocalevadenavalserveheathdwarfmodelkarmastinkgradequietbenchabatefeignmajordeathfreshcruststoolcolonabasemarryreactbattyprideflosshelixcroakstaffpaperunfedwhelptrawloutdoadobecrazysowerrepaydigitcratecluckspikemimicpoundmaximlinenunmetfleshboobyforthfirststandbellyivoryseedyprintyearndrainbribestoutpanelcrassflumeoffalagreeerrorswirlarguebleeddeltaflicktotemwooerfrontshrubparrybiomelapelstartgreetgonergolemlustyloopyroundauditlyinggammalaborisletcivicforgecornymoultbasicsaladagatespicysprayessayfjordspendkebabguildabackmotoralonehatchhyperthumbdowryoughtbelchdutchpilottweedcometjauntenemasteedabyssgrowlflingdozenboozyerodeworldgougeclickbriargreataltarpulpyblurtcoastduchygroinfixergrouproguebadlysmartpithygaudychillheronvodkafinersurerradiorougeperchretchwroteclocktildestoreprovebringsolvecheatgrimeexultusherepochtriadbreakrhinoviralconicmassesonicvitaltraceusingpeachchampbatonbrakepluckcrazegripewearypickyacuteferryasidetapirtrollunifyrebusboosttrusssiegetigerbanalslumpcrankgorgequerydrinkfavorabbeytangypanicsolarshireproxypointrobotprickwincecrimpknollsugarwhackmountperkycouldwrunglightthosemoistshardpleataloftskillelderframehumorpauseulcerultrarobincynicagoraaromacaulkshakepupaldodgeswilltacitotherthorntroveblokevividspillchantchokerupeenastymournaheadbrineclothhoardsweetmonthlapsewatchtodayfocussmeltteasecatermovielynchsauteallowrenewtheirsloshpurgechestdepotepoxynymphfoundshallharrystovelowlysnouttropefewershawlnatalfibrecommaforayscarestairblacksquadroyalchunkminceslaveshamecheekampleflairfoyercargooxideplantoliveinertaskewheistshownzestyhastytrashfellalarvaforgostoryhairytrainhomerbadgemidstcannyfetusbutchfarceslungtipsymetalyielddelvebeingscourglassgamerscrapmoneyhingealbumvouchassettiaracreptbayouatollmanorcreakshowyphasefrothdepthgloomfloodtraitgirthpietypayergoosefloatdonoratoneprimoapronblowncacaoloserinputgloatawfulbrinksmitebeadyrustyretrodrollgawkyhutchpintogailyegretlilacseverfieldfluffhydroflackagapewenchvoicesteadstalkberthmadamnightblandliverwedgeaugurroomywackyflockangrybobbytriteaphidtrystmidgepowerelopecinchmottostompupsetbluffcrampquartcoylyyouthrhymebuggyaliensmearunfitpattyclinggleanlabelhunkykhakipokergrueltwicetwangshrugtreatunlitwastemeritwovenoctalneedyclownwidowironyrudergauzechiefonsetprizefungicharmgullyinterwhooptauntleeryclassthemeloftytibiaboozealphathymeeclatdoubtparerchutesticktricealikesoothrecapsaintliegeglorygrateadmitbrisksoggyusurpscaldscornleavetwinestingboughmarshslothdandyvigorhowdyenjoyvalidionicequalunsetfloorcatchspadesteinexistquirkdenimgrovespielmummyfaultfoggyfloutcarrysneaklibelwaltzaptlypineyineptaloudphotodreamstalevomitombrefannyunitesnarlbakerthereglyphpoochhippyspellfollylousegulchvaultgodlythrewfleetgraveinaneshockcravespitevalveskimpclaimrainymustypiquedaddyquasiariseagingvaletopiumavertstuckrecutmulchgenreplumeriflecountincurtotalwrestmochadeterstudyloversaferrivetfunnysmokemoundunduesedanpaganswineguilegustyequiptoughcanoechaoscovethumanudderlunchblaststraymangameleeleftyquickpastegivenoctetrisengroanleakygrindcarveloosesadlyspiltappleslackhoneyfinalsheeneeriemintyslickderbywharfspeltcoacheruptsingepricespawnfairyjiffyfilmystackchosesleepardornannyniecewoozyhandygracedittostankcreamusualdiodevalorangleninjamuddychasereplypronespoilheartshadedinerarsononionsleetdowelcouchpalsybowelsmileevokecreeklanceeagleidiotsirenbuiltembedawarddrossannulgoodyfrownpatioladenhumidelitelymphedifymightresetvisitgustopursevaporcrockwritesunnyloathchaffslidequeervenomstampsorrystillacornapingpushytamerhatermaniaawokebrawnswiftexilebirchluckyfreerriskyghostplierlunarwinchsnarenursehouseboraxnicerlurchexaltaboutsavvytoxintunicpriedinlaychumplankycresseatereludecyclekittyboulemorontenetplacelobbyplushvigilindexblinkclungqualmcroupclinkjuicystagedecaynervefliershaftcrookcleanchinaridgevowelgnomesnuckicingspinyrigorsnailflownrabidprosethankpoppybudgefibermoldydowdykneeltrackcaddyquelldumpypalersworerebarscubasplatflyerhornymasondoingozoneamplymolarovarybesetqueuecliffmagictrucesportfritzedicttwirlversellamaeatenrangewhiskhovelrehabmacawsigmaspoutvervesushidyingfetidbrainbuddythumpscioncandychordbasinmarchcrowdarborgaylymuskystaindallyblessbravostungtitlerulerkioskblondennuilayerfluidtattyscorecutiezebrabargemateyblueraidershookriverprivybetelfriskbongobegunazureweavegeniesoundglovebraidscopewrylyroverassayoceanbloomiratelaterwokensilkywreckdweltslatesmacksolidamazehazelwristjollyglobeflintrousecivilvistarelaxcoveralivebeechjettyblissvocaloftendollyeightjokersinceeventensueshuntdiverposerworstsweepalleycreedanimeleafybosomduncestarepudgywaivechoirstoodspokeoutgodelaybilgeidealclaspseizehotlylaughsieveblockmeantgrapenoosehardyshieddrawldaisyputtystrutburnttulipcrickidyllvixenfurorgeekycoughnaiveshoalstorkbatheauntycheckprimebrassouterfurryrazorelectevictimplydemurquotahavencavilswearcrumpdoughgavelwagonsalonnudgeharempitchswornpupilexcelstonycabinunzipqueentroutpolypearthstormuntiltaperenterchildadoptminorfattyhuskybravefiletslimeglinttreadstealregalguesteverymurkysharesporehoistbuxominnerotterdimlylevelsumacdonutstiltarenasheetscrubfancyslimypearlsillyporchdingosepiaambleshadybreadfriarreigndairyquillcrossbroodtubershearpositblankvillashankpiggyfreakwhichamongfecalshellwouldalgaelargerabbiagonyamusebushycopseswoonknifepouchascotplanecrownurbansniderelayabideviolarajahstrawdillycrashamassthirdtricktutorwoodyblurbgriefdiscowheresassybeachsaunacomiccluedcreepcastegrazesnufffrockgonaddrunkprongluridsteelhalvebuyervinylutilesmelladageworrytastylocaltradefinchashenmodalgauntcloveenactadornroastspecksheikmissygruntsnooppartytouchmafiaemceearraysouthvapidjellyskulkangsttuballowercrestsweatcyberadoretardyswaminotchgroomroachhitchyoungalignreadyfrondstrappureerealmvenueswarmoffersevendryerdiarydrylydrankacridheadythetajuntopixiequothbonusshaltpenneamenddatumbuildpianoshelflodgesuingrearmcoralramenworthpsalminferovertmayorovoidglideusagepoiserandychuckprankfishytoothetherdroveidlerswathstintwhilebegatapplyslangtarotradarcredoawarecanonshifttimerbylawserumthreesteakiliacshirkbluntpuppypenaljoistbunnyshapebegetwheeladeptstuntstoletopazchoreflukeafootbloatbullydensecapersneerboxerjumbolungespaceavailshortslurployalflirtpizzaconchtempodroopplatebibleplunkafoulsavoysteepagilestakedwellknavebeardarosemotifsmashbroilglareshovebaggymammyswampalongrugbywagerquacksquatsnakydebitmangeskateninthjousttrampspurnmedalmicrorebelflanklearnnadirmaplecomfyremitgruffesterleastmogulfetchcauseoakenaglowmeatygaffeshylyracerprowlthiefsternpoesyrockytweetwaistspiregropehavocpatsytrulyfortydeityuncleswishgiverpreenbevellemurdraftslopeannoylingobleakdittycurlycedardirgegrownhordedroolshuckcryptcuminstockgravylocuswiderbreedquitechafecacheblimpdeignfiendlogiccheapeliderigidfalserenalpencerowdyshootblazeenvoypossebriefneverabortmousemuckysulkyfierymediatrunkyeastclearskunkscalpbittyciderkoaladuvetseguecremesupergrillafterowneremberreachnoblyemptyspeedgipsyrecursmockdreadmergeburstkappaamityshakyhovercarolsnortsynodfainthauntflourchairdetoxshrewtensepliedquarkburlynovelwaxenstoicjerkyblitzbeefylyrichussytowelquiltbelowbingowispybrashsconetoasteaselsaucyvaluespicehonorroutesharpbawdyradiiskullphonyissuelagerswellurinegassytrialfloraupperlatchwightbrickretryhollydecalgrassshackdogmamoverdefersoberopticcriervyingnomadflutehipposharkdrierobesebugletawnychalkfeastruddypedalscarfcruelbleattidalslushsemenwindydustysallyigloonerdyjewelshonewhalehymenabusefugueelbowcrumbpansywelshsyruptersesuavegamutswungdrakefreedafireshirtgroutoddlytitheplaiddummybroomblindtorchenemyagaintyingpeskyaltergazernobleethosbrideextoldecorhobbybeastidiomutterthesesixthalarmeraseelegyspunkpiperscalyscoldheftychicksootycanalwhinyslashquakejointsweptprudeheavywieldfemmelassomaizeshalescrewspreesmokywhiffscentgladespentprismstokeriperorbitcocoaguilthumusshushtablesmirkwrongnoisyalertshinyelateresinwholehunchpixelpolarhotelswordcleatmangorumbapuffyfillybillyleashcloutdanceovatefacetchilipaintlinercuriosaltyaudiosnakefablecloaknavelspurtpestobalmyflashunwedearlychurnweedystumpleasewittywimpyspoofsanerblendsalsathickwartymanicblaresquibspoonprobecrepeknackforcedebutorderhasteteethagentwidenicilysliceingotclashjurorbloodabodethrowunitypivotslepttroopsparesewerparsemorphcactitackyspooldemonmoodyannexbeginfuzzypatchwaterlumpyadminomegalimittabbymachoaisleskiffbasisplankvergebotchcrawllousyslaincubicraisewrackguidefoistcameounderactorrevuefraudharpyscoopclimbreferoldenclerkdebartallyethiccairntulleghoulhillycrudeapartscaleolderplainspermbrinyabbotrerunquestcrispboundbefitdrawnsuiteitchycheerbagelguessbroadaxiomchardcaputleantharshcurseproudswingopinetastelupusgumbominergreenchasmlipidtopicarmorbrushcranemuralabledhabitbossymakerduskydizzylithebrookjazzyfiftysensegiantsurlylegalfatalflunkbeganprunesmallslantscofftorusninnycoveyvipertakenmoralvogueowingtokenentryboothvoterchideelfinebonyneighminimmelonkneeddecoyvoilaanklearrowmushytribeceaseeagerbirthgraphodderterraweirdtriedclackcolorroughweighuncutladlestripcraftminusdiceytitanlucidvicardressditchgypsypastataffyflameswoopaloofsightbroketearychartsixtywordysheerlepernoseybulgesavorclampfunkyfoamytoxicbrandplumbdingybuttedrilltripebiceptenorkrillworsedramahyenathinkratiocobrabasilscrumbusedphonecourtcamelproofheardangelpetalpoutythrobmaybefetalsprigspineshoutcadetmacrododgysatyrrarerbingetrendnuttyleaptamisssplitmyrrhwidthsonartowerbaronfeverwaversparkbeliesloopexpelsmotebalerabovenorthwaferscantfrillawashsnackscowlfraildriftlimbofencemotelouncewreakreveltalonpriorkneltcelloflakedebuganodecrimesalvescoutimbuepinkystavevaguechockfightvideostoneteachcleftfrostprawnbootytwistapneastiffplazaledgetweakboardgrantmedicbaconcablebrawlslunkraspyforumdronewomenmucusboasttoddycoventumortruerwrathstallsteamaxialpurerdailytrailnichemealyjuicenylonplumpmerryflailpapalwheatberrycowererectbruteleggysnipesinewskierpennyjumpyrallyumbrascarymodemgrossaviangreedsatintonicparkasnifflividstarktrumpgiddyreusetabooavoidquotedevillikenglossgayerberetnoiseglanddealtslingrumoroperathightongaflarewoundwhitebulkyetudehorsecircapaddyinboxfizzygrainexertsurgegleambellesalvocrushfruitsappytakertractovinespikyfrankreedyfilthspasmheavemamborightclanktrustlumenbornespooksauceamberlathecaratcorerdirtyslylyaffixalloytaintsheepkinkywoolymauveflungyachtfriedquailbruntgrimycurvycageyrinsedeucestategraspmilkybisongraftsandybasteflaskhedgegirlyswashboneycoupeendowabhorwelchbladetightgeesemisermirthcloudcaballeechclosetenthpecandroitgrailcloneguiseralphtangobiddysmithmowerpayeeserifdrapefifthspankglazeallottruckkayakvirustestytepeefullyzonalmetrocurrygrandbanjoaxionbezeloccurchainnasalgooeyfilerbraceallaypubicravenpleadgnashflakymunchdullyekingthingslinkhurrytheftshornpygmyranchwringlemonshoremammafrozenewerstylemooseanticdrownveganchessguppyunionleverlorryimagecabbydruidexacttruthdopeyspearcriedchimecronystunktimidbatchgaugerotorcrackcurvelattewitchbunchrepelanvilsoapymeterbrothmadlydriedsceneknownmagmaroostwomanthongpunchpastydownykneadwhirlrapidclangangerdrivegoofyemailmusicstuffbleepridermeccafoliosetupversoquashfaunagummyhappynewlyfussyrelicguavarattyfudgefemurchirpfortealibiwhinepettygollyplaitfleckfelongourdbrownthrumficusstashdecrywiserjuntavisordauntscreeimpelawaitpresswhoseturbostoopspeakmangyeyinginletcronepulsemossystaidhencepinchteddysullysnoreripensnowyatticgoingleachmouthhoundclumptonalbigotperilpieceblamehautespiedundidintrobasalshinegeckorodeoguardsteerloamyscampscrammanlyhellovauntorganferalknockextracondoadaptwillypolkarayonskirtfaithtorsomatchmercytepidsleekrisertwixtpeaceflushcattyloginejectrogerrivaluntierefitaortaadultjudgerowerartsyruralshave";
const ALLOWED = "aahedaaliiaarghaartiabacaabaciabacsabaftabakaabampabandabashabaskabayaabbasabbedabbesabceeabeamabearabeleabersabetsabiesablerablesabletablowabmhoabohmaboilabomaaboonabordaboreabramabrayabrimabrinabrisabseyabsitabunaabuneabutsabuzzabyesabysmacaisacariaccasaccoyacerbacersacetaacharachedachesachooacidsacidyacingaciniackeeackeracmesacmicacnedacnesacockacoldacredacresacrosactedactinactonacylsadawsadaysadbotaddaxaddedadderaddioaddleadeemadhanadieuadiosaditsadmanadmenadmixadoboadownadozeadradadredadsumadukiaduncadustadvewadytaadzedadzesaeciaaedesaegisaeonsaerieaerosaesirafaldafaraafarsafearaflajaforeafritafrosagamaagamiagarsagastagaveagazeageneagersaggeraggieaggriaggroaggryaghasagilaagiosagismagistagitaagleeagletagleyaglooaglusagmasagogeagoneagonsagoodagriaagrinagrosaguedaguesagunaagutiaheapahentahighahindahingahintaholdahullahuruaidasaidedaidesaidoiaidosaieryaigasaightailedaimedaimeraineeaingaaioliairedairerairnsairthairtsaitchaitusaiveraiyeeaizleajiesajivaajugaajwanakeesakelaakeneakingakitaakkasalaapalackalamoalandalanealangalansalantalapaalapsalaryalatealaysalbasalbeealcidalcosaldeaalderaldolaleckalecsalefsaleftalephalewsaleyealfasalgalalgasalgidalginalgoralgumaliasalifsalinealistaliyaalkiealkosalkydalkylalleeallelallisallodallylalmahalmasalmehalmesalmudalmugalodsaloedaloesalohaaloinaloosalowealthoaltosalulaalumsalurealvaralwayamahsamainamateamautambanambitambosambryamebaameerameneamensamentamiasamiceamiciamideamidoamidsamiesamigaamigoamineaminoaminsamirsamlasammanammonammosamniaamnicamnioamoksamoleamortamouramoveamowtampedampulamritamuckamylsananaanataanchoancleanconandroanearaneleanentangasangloanighanileanilsanimaanimianionaniseankerankhsankusanlasannalannasannatanoasanoleanomyansaeantaeantarantasantedantesantisantraantreantsyanuraanyonapaceapageapaidapaydapaysapeakapeekapersapertaperyapgaraphisapianapiolapishapismapodeapodsapoopaportappalappayappelapproappuiappuyapresapsesapsisapsosaptedapteraquaeaquasarabaaraksarameararsarbasarcedarchiarcosarcusardebardriareadareaearealarearareasarecaareddaredearefyareicarenearepaarerearetearetsarettargalarganargilargleargolargonargotargusarhatariasarielarikiarilsariotarisharkedarledarlesarmedarmerarmetarmilarnasarnutarobaarohaaroidarpasarpenarraharrasarretarrisarrozarsedarsesarseyarsisartalartelarticartisaruhearumsarvalarveearvosarylsasanaasconascusasdicashedashesashetaskedaskeraskoiaskosaspenasperaspicaspieaspisasproassaiassamassesassezassotasterastirastunasuraaswayaswimasylaatapsataxyatigiatiltatimyatlasatmanatmasatmosatocsatokeatoksatomsatomyatonyatopyatriaatripattapattaratuasaudadaugeraughtaulasaulicauloiaulosaumilaunesauntsauraeauralauraraurasaureiauresauricaurisaurumautosauxinavaleavantavastavelsavensaversavgasavineavionaviseavisoavizeavowsavyzeawarnawatoawaveawaysawdlsaweelawetoawingawmryawnedawnerawolsaworkaxelsaxileaxilsaxingaxiteaxledaxlesaxmanaxmenaxoidaxoneaxonsayahsayayaayelpaygreayinsayontayresayrieazansazideazidoazineazlonazoicazoleazonsazoteazothazukiazurnazuryazygyazymeazymsbaaedbaalsbabasbabelbabesbabkababoobabulbabusbaccabaccobaccybachabachsbacksbaddybaelsbaffsbaffybaftsbaghsbagiebahtsbahusbahutbailsbairnbaisabaithbaitsbaizabaizebajanbajrabajribajusbakedbakenbakesbakrabalasbaldsbaldybaledbalesbalksbalkyballsballybalmsbaloobalsabaltibalunbalusbambibanakbancobancsbandabandhbandsbandybanedbanesbangsbaniabanksbannsbantsbantubantybanyabapusbarbebarbsbarbybarcabardebardobardsbardybaredbarerbaresbarfibarfsbaricbarksbarkybarmsbarmybarnsbarnybarpsbarrabarrebarrobarrybaryebasanbasedbasenbaserbasesbashobasijbasksbasonbassebassibassobassybastabastibastobastsbatedbatesbathsbatikbattabattsbattubaudsbauksbaulkbaursbavinbawdsbawksbawlsbawnsbawrsbawtybayedbayerbayesbaylebaytsbazarbazoobeadsbeaksbeakybealsbeamsbeamybeanobeansbeanybearebearsbeathbeatsbeatybeausbeautbeauxbebopbecapbeckebecksbedadbedelbedesbedewbedimbedyebeedibeefsbeepsbeersbeerybeetsbefogbegadbegarbegembegotbegumbeigebeigybeinsbekahbelahbelarbelaybeleebelgabellsbelonbeltsbemadbemasbemixbemudbendsbendybenesbenetbengabenisbennebennibennybentobentsbentybepatberayberesbergsberkoberksbermebermsberobberylbesatbesawbeseebesesbesitbesombesotbestibestsbetasbetedbetesbethsbetidbetonbettabettybeverbevorbevuebevvybewetbewigbezesbezilbezzybhaisbhajibhangbhatsbhelsbhootbhunabhutsbiachbialibialybibbsbibesbiccybicesbidedbiderbidesbidetbidisbidonbieldbiersbiffobiffsbiffybifidbigaebiggsbiggybighabightbiglybigosbijoubikedbikerbikesbikiebilbobilbybiledbilesbilgybilksbillsbimahbimasbimbobinalbindibindsbinerbinesbingsbingybinitbinksbintsbiogsbiontbiotabipedbipodbirdsbirksbirlebirlsbirosbirrsbirsebirsybisesbisksbisombitchbiterbitesbitosbitoubitsybittebittsbiviabivvybizesbizzobizzyblabsbladsbladyblaerblaesblaffblagsblahsblainblamsblartblaseblashblateblatsblattblaudblawnblawsblaysblearblebsblechbleesblentblertblestbletsbleysblimyblingbliniblinsblinyblipsblistbliteblitsbliveblobsblocsblogsblookbloopbloreblotsblowsblowyblubsbludebludsbludybluedbluesbluetblueybluidblumeblunkblursblypeboabsboaksboarsboartboatsbobacbobakbobasbobolbobosboccabocceboccibochebocksbodedbodesbodgebodhibodleboepsboetsboeufboffoboffsboganbogeyboggybogiebogleboguebogusboheabohosboilsboingboinkboitebokedbokehbokesbokosbolarbolasboldsbolesbolixbollsbolosboltsbolusbomasbombebombobombsboncebondsbonedbonerbonesbongsboniebonksbonnebonnybonzabonzebooaibooayboobsboodybooedboofyboogyboohsbooksbookyboolsboomsboomyboongboonsboordboorsboosebootsboppyborakboralborasbordebordsboredboreeborelborerboresborgoboricborksbormsbornaboronbortsbortybortzbosiebosksboskybosonbosunbotasbotelbotesbothybottebottsbottybougebouksboultbounsbourdbourgbournbousebousyboutsbovidbowatbowedbowerbowesbowetbowiebowlsbownebowrsbowseboxedboxenboxesboxlaboxtyboyarboyauboyedboyfsboygsboylaboyosboysybozosbraaibrachbrackbractbradsbraesbragsbrailbraksbrakybramebranebrankbransbrantbrastbratsbravabravibrawsbraxybraysbrazabrazebreambredebredsbreembreerbreesbreidbreisbremebrensbrentbrerebrersbrevebrewsbreysbrierbriesbrigsbrikibriksbrillbrimsbrinsbriosbrisebrissbrithbritsbrittbrizebrochbrockbrodsbroghbrogsbromebromobroncbrondbroolbroosbrosebrosybrowsbrughbruinbruitbrulebrumebrungbruskbrustbrutsbuatsbuazebubalbubasbubbabubbebubbybubusbuchubuckobucksbuckubudasbudisbudosbuffabuffebuffibuffobuffsbuffybufosbuftybuhlsbuhrsbuiksbuistbukesbulbsbulgybulksbullabullsbulsebumbobumfsbumphbumpsbumpybunasbuncebuncobundebundhbundsbundtbundubundybungsbungybuniabunjebunjybunkobunksbunnsbuntsbuntybunyabuoysbuppyburanburasburbsburdsburetburfiburghburgsburinburkaburkeburksburlsburnsburooburpsburqaburroburrsburrybursabursebusbybusesbusksbuskybussubustibustsbustybuteobutesbutlebutohbuttsbuttybututbutylbuzzybwanabwazibydedbydesbykedbykesbyresbyrlsbyssibytesbywaycaaedcabascabercabobcaboccabrecacascackscackycadeecadescadgecadgycadiecadiscadrecaecacaesecafescaffscagedcagercagescagotcahowcaidscainscairdcajoncajuncakedcakescakeycalfscalidcalifcalixcalkscallacallscalmscalmycaloscalpacalpscalvecalyxcamancamascamescamiscamoscampicampocampscampycamuscanedcanehcanercanescangscanidcannacannscansocanstcantocantscantycapascapedcapescapexcaphscapizcaplecaponcaposcapotcapricapulcarapcarbocarbscarbycardicardscardycaredcarercarescaretcarexcarkscarlecarlscarnscarnycarobcaromcaroncarpicarpscarrscarsecartacartecartscarvycasascascocasedcasescaskscaskycastscasuscatescaudacaukscauldcaulscaumscaupscauricausacavascavedcavelcavercavescaviecawedcawkscaxonceazecebidcecalcecumcededcedercedescedisceibaceiliceilscelebcellacellicellscelomceltscensecentocentscentuceorlcepescerciceredcerescergeceriacericcernecerocceroscertscertycessecestacesticetescetylcezvechacechackchacochadochadschaftchaischalschamschanachangchankchapechapschaptcharacharecharkcharrcharscharychatschavechavschawkchawschayachayscheepchefschekachelachelpchemochemscherechertchethchevychewschewychiaochiaschibschicachichchicochicschielchikschilechimbchimochimpchinechingchinkchinochinschipschirkchirlchirmchirochirrchirtchiruchitschivechivschivychizzchocochocschodechogschoilchokochokycholacholicholochompchonschoofchookchoomchoonchopschotachottchoutchouxchowkchowschubschufachuffchugschumschurlchurrchusechutschylechymechyndcibolcidedcidescielsciggyciliacillscimarcimexcinctcinescinqscionscippicircscirescirlscirriciscocissycistscitalcitedcitercitescivescivetciviecivvyclachcladecladsclaesclagsclameclamsclansclapsclaptclaroclartclaryclastclatsclautclaveclaviclawsclayscleckcleekcleepclefsclegscleikclemsclepecleptcleveclewscliedcliescliftclimeclineclintclipeclipscliptclitscloamclodscloffclogsclokeclombclompclonkclonscloopclootclopscloteclotsclourclousclowscloyecloysclozeclubscluesclueyclunkclypecnidacoactcoadycoalacoalscoalycoaptcoarbcoatecoaticoatscobbscobbycobiacoblecobzacocascoccicoccocockscockycocoscodascodeccodedcodencodercodescodexcodoncoedscoffscogiecogoncoguecohabcohencohoecohogcohoscoifscoigncoilscoinscoirscoitscokedcokescolascolbycoldscoledcolescoleycoliccolincollscollycologcoltscolzacomaecomalcomascombecombicombocombscombycomercomescomixcommocommscommycompocompscomptcomtecomusconedconesconeyconfscongacongecongoconiaconinconksconkyconneconnscontecontoconusconvocoochcooedcooeecooercooeycoofscookscookycoolscoolycoombcoomscoomycoonscoopscooptcoostcootscoozecopalcopaycopedcopencopercopescoppycopracopsycoquicoramcorbecorbycordscoredcorescoreycorgicoriacorkscorkycormscornicornocornscornucorpscorsecorsocoseccosedcosescosetcoseycosiecostacostecostscotancotedcotescothscottacottscoudecoupscourbcourdcourecourscoutacouthcovedcovescovincowalcowancowedcowkscowlscowpscowrycoxaecoxalcoxedcoxescoxibcoyaucoyedcoyercoypucozedcozencozescozeycoziecraalcrabscragscraiccraigcrakecramecramscranscrapecrapscrapycrarecrawscrayscredscreelcreescremscrenacrepscrepycrewecrewscriascribscriescrimscrinecrioscripecripscrisecrithcritscrocicrocscroftcrogscrombcromecronkcronscroolcrooncropscrorecrostcroutcrowscrozecruckcrudocrudscrudycruescruetcruftcrunkcruorcruracrusecrusycruvecrwthcryerctenecubbycubebcubedcubercubescubitcuddycuffocuffscuifscuingcuishcuitscukesculchculetculexcullscullyculmsculpaculticultscultycumeccundycuneicunitcuntscupelcupidcuppacuppycuratcurbscurchcurdscurdycuredcurercurescuretcurfscuriacuriecurlicurlscurnscurnycurrscursicurstcuseccushycuskscuspscuspycussocusumcutchcutercutescuteycutincutiscuttocuttycutupcuveecuzescwtchcyanocyanscycadcycascyclocydercylixcymaecymarcymascymescymolcystscytescytonczarsdaalsdabbadacesdachadacksdadahdadasdadosdaffsdaffydaggadaggydagosdahlsdaikodainedaintdakerdaleddalesdalisdalledaltsdamandamardamesdammedamnsdampsdampydancydangsdaniodanksdannydantsdarafdarbsdarcydareddarerdaresdargadargsdaricdarisdarksdarkydarnsdarredartsdarzidashidashydataldateddaterdatesdatosdattodaubedaubsdaubydaudsdaultdaursdautsdavendavitdawahdawdsdaweddawendawksdawnsdawtsdayandaychdayntdazeddazerdazesdeadsdeairdealsdeansdearedearndearsdearydeashdeavedeawsdeawydebagdebbydebeldebesdebtsdebuddeburdebusdebyedecaddecafdecandeckodecksdecosdedaldeedsdeedydeelydeemsdeensdeepsdeeredeersdeetsdeevedeevsdefatdeffodefisdefogdegasdegumdegusdeicedeidsdeifydeilsdeismdeistdekeddekesdekkodeleddelesdelfsdelftdelisdellsdellydelosdelphdeltsdemandemesdemicdemitdemobdemoidemosdemptdenardenaydenchdenesdenetdenisdentsdeoxyderatderayderedderesderigdermadermsdernsdernyderosderroderryderthdervsdesexdeshidesisdesksdessedevasdeveldevisdevondevosdevotdewandewardewaxdeweddexesdexiedhabadhaksdhalsdhikrdhobidholedholldholsdhotidhowsdhutidiactdialsdianediazodibbsdiceddicerdicesdichtdicksdickydicotdictadictsdictydiddydidiedidosdidstdiebsdielsdienedietsdiffsdightdikasdikeddikerdikesdikeydildodillidillsdimbodimerdimesdimpsdinardineddinesdingedingsdinicdinksdinkydinnadinosdintsdiolsdiotadippydipsodiramdirerdirkedirksdirlsdirtsdisasdiscidiscsdishydisksdismeditalditasditedditesditsydittsditzydivandivasdiveddivesdivisdivnadivosdivotdivvydiwandixiedixitdiyasdizendjinndjinsdoabsdoatsdobbydobesdobiedobladobradobrodochtdocksdocosdocusdoddydodosdoeksdoersdoestdoethdoffsdogandogesdogeydoggodoggydogiedohyodoiltdoilydoitsdojosdolcedolcidoleddolesdoliadollsdolmadolordolosdoltsdomaldomeddomesdomicdonahdonasdoneedonerdongadongsdonkodonnadonnedonnydonsydoobsdoocedoodydooksdooledoolsdoolydoomsdoomydoonadoorndoorsdoozydopasdopeddoperdopesdoraddorbadorbsdoreedoresdoricdorisdorksdorkydormsdormydorpsdorrsdorsadorsedortsdortydosaidosasdoseddosehdoserdosesdoshadotaldoteddoterdotesdottydouardoucedoucsdouksdouladoumadoumsdoupsdouradousedoutsdoveddovendoverdovesdoviedowardowdsdoweddowerdowiedowledowlsdowlydownadownsdowpsdowsedowtsdoxeddoxesdoxiedoyendoylydozeddozerdozesdrabsdrackdracodraffdragsdraildramsdrantdrapsdratsdravedrawsdraysdreardreckdreeddreerdreesdregsdreksdrentdreredrestdreysdribsdricedriesdrilydripsdriptdroiddroildrokedroledromedronydroobdroogdrookdropsdroptdroukdrowsdrubsdrugsdrumsdrupedrusedrusydruxydryaddryasdsobodsomoduadsdualsduansduarsdubboducalducatducesducksduckyductsduddydudeddudesduelsduetsduettduffsdufusduingduitsdukasdukeddukesdukkadulcedulesduliadullsdulsedumasdumbodumbsdumkadumkydumpsdunamdunchdunesdungsdungydunksdunnodunnydunshduntsduomiduomodupedduperdupesdupleduplyduppyduraldurasduredduresdurgydurnsdurocdurosduroydurradurrsdurrydurstdurumdurzidusksdustsduxesdwaaldwaledwalmdwamsdwangdwaumdweebdwiledwinedyadsdyersdykeddykesdykeydykondyneldynesdzhoseagreealedealeseanedeardsearedearlsearnsearntearsteasedeasereaseseasleeastseatheeavedeavesebbedebbetebonsebookecadsechedechesechosecrusedemaedgededgeredgesedileeditseduceeducteejiteensyeeveneevnseffedegadsegersegesteggareggedeggeregmasehingeidereidoseigneeikedeikoneildseiselejidoekkaselainelandelanselchieldinelemielfedeliadelintelmenelogeelogyeloinelopselpeeelsineluteelvanelvenelverelvesemacsembarembayembogembowemboxembusemeeremendemergemeryemeusemicsemirsemitsemmasemmeremmetemmewemmysemojiemongemoteemoveemptsemuleemureemydeemydsenarmenateendedenderendewendueenewsenfixeniacenlitenmewennogenokienolsenormenowsenrolensewenskyentiaenureenurnenvoienzymeorlseosinepactepeesephahephasephodephorepicsepodeepopteprisequesequiderbiaerevsergonergosergoterhusericaerickericseringernederneseroseerrederseseructerugoeruvservenervilescarescotesileeskareskeresnesessesestocestopestroetageetapeetatsetensethalethneethyleticsetnasettinettleetuisetweeetymaeughseukedeupadeuroseusolevensevertevetsevhoeevilseviteevoheewersewestewhowewkedexamsexeatexecsexeemexemeexfilexiesexineexingexitsexodeexomeexonsexpatexposexudeexulsexurbeyasseyerseyotseyraseyreseyrieeyrirezinefabbyfacedfacerfacesfaciafactafactsfaddyfadedfaderfadesfadgefadosfaenafaeryfaffsfaffyfaggyfaginfagotfaiksfailsfainefainsfairsfakedfakerfakesfakeyfakiefakirfalajfallsfamedfamesfanalfandsfanesfangafangofangsfanksfanonfanosfanumfaqirfaradfarcifarcyfardsfaredfarerfaresfarlefarlsfarmsfarosfarrofarsefartsfascifastifastsfatedfatesfatlyfatsofatwafaughfauldfaunsfaurdfautsfauvefavasfavelfaverfavesfavusfawnsfawnyfaxedfaxesfayedfayerfaynefayrefazedfazesfealsfearefearsfeartfeasefeatsfeazefecesfechtfecitfecksfedexfeebsfeedsfeelsfeensfeersfeesefeezefehmefeintfeistfelchfelidfellsfellyfeltsfeltyfemalfemesfemmyfendsfendyfenisfenksfennyfentsfeodsfeofffererferesferiaferlyfermifermsfernsfernyfessefestafestsfestyfetasfetedfetesfetorfettafettsfetwafeuarfeudsfeuedfeyedfeyerfeylyfezesfezzyfiarsfiatsfibroficesfichefichuficinficosfidesfidgefidosfiefsfientfierefiersfiestfifedfiferfifesfifisfiggyfigosfikedfikesfilarfilchfiledfilesfiliifilksfillefillofillsfilmifilmsfilosfilumfincafindsfinedfinesfinisfinksfinnyfinosfiordfiqhsfiquefiredfirerfiresfiriefirksfirmsfirnsfirryfirthfiscsfisksfistsfistyfitchfitlyfitnafittefittsfiverfivesfixedfixesfixitfjeldflabsflaffflagsflaksflammflamsflamyflaneflansflapsflaryflatsflavaflawnflawsflawyflaxyflaysfleamfleasfleekfleerfleesflegsflemefleurflewsflexiflexofleysflicsfliedfliesflimpflimsflipsflirsfliskfliteflitsflittflobsflocsfloesflogsflongflopsflorsfloryfloshflotafloteflowsflubsfluedfluesflueyflukyflumpfluorflurrflutyfluytflybyflypeflytefoalsfoamsfoehnfogeyfogiefoglefogoufohnsfoidsfoilsfoinsfoldsfoleyfoliafolicfoliefolksfolkyfomesfondafondsfondufonesfonlyfontsfoodsfoodyfoolsfootsfootyforamforbsforbyfordofordsforelforesforexforksforkyformeformsfortsforzaforzefossafossefouatfoudsfouerfouetfoulefoulsfountfoursfouthfoveafowlsfowthfoxedfoxesfoxiefoylefoynefrabsfrackfractfragsfraimfrancfrapefrapsfrassfratefratifratsfrausfraysfreesfreetfreitfremdfrenafreonfrerefretsfribsfrierfriesfrigsfrisefristfrithfritsfrittfrizefrizzfroesfrogsfronsfrorefrornfroryfroshfrowsfrowyfrugsfrumpfrushfrustfryerfubarfubbyfubsyfucksfucusfuddyfudgyfuelsfuerofuffsfuffyfugalfuggyfugiefugiofuglefuglyfugusfujisfullsfumedfumerfumesfumetfundifundsfundyfungofungsfunksfuralfuranfurcafurlsfurolfurrsfurthfurzefurzyfusedfuseefuselfusesfusilfusksfustsfustyfutonfuzedfuzeefuzesfuzilfycesfykedfykesfylesfyrdsfyttegabbagabbygablegaddigadesgadgegadidgadisgadjegadjogadsogaffsgagedgagergagesgaidsgainsgairsgaitagaitsgaittgajosgalahgalasgalaxgaleagaledgalesgallsgallygalopgalutgalvogamasgamaygambagambegambogambsgamedgamesgameygamicgamingammegammygampsganchgandyganefganevgangsganjaganofgantsgaolsgapedgapergapesgaposgappygarbegarbogarbsgardagaresgarisgarmsgarnigarregarthgarumgasesgaspsgaspygastsgatchgatedgatergatesgathsgatorgauchgaucygaudsgaujegaultgaumsgaumygaupsgaursgaussgauzygavotgawcygawdsgawksgawpsgawsygayalgazalgazargazedgazesgazongazoogealsgeansgearegearsgeatsgeburgecksgeeksgeepsgeestgeistgeitsgeldsgeleegelidgellygeltsgemelgemmagemmygemotgenalgenasgenesgenetgenicgeniigenipgennygenoagenomgenrogentsgentygenuagenusgeodegeoidgerahgerbegeresgerlegermsgermygernegessegessogestegestsgetasgetupgeumsgeyangeyerghastghatsghautghazigheesghestghyllgibedgibelgibergibesgibligibusgiftsgigasgighegigotgiguegilasgildsgiletgillsgillygilpygiltsgimelgimmegimpsgimpyginchgingegingsginksginnyginzogipongippogippygirdsgirlsgirnsgirongirosgirrsgirshgirtsgismogismsgistsgitchgitesgiustgivedgivesgizmoglacegladsgladyglaikglairglamsglansglaryglaumglaurglazyglebaglebeglebygledegledsgleedgleekgleesgleetgleisglensglentgleysglialgliasglibsgliffgliftglikeglimeglimsgliskglitsglitzgloamglobiglobsglobyglodegloggglomsgloopglopsglostgloutglowsglozegluedgluergluesglueyglugsglumeglumsgluongluteglutsgnarlgnarrgnarsgnatsgnawngnawsgnowsgoadsgoafsgoalsgoarygoatsgoatygobangobargobbigobbogobbygobisgobosgodetgodsogoelsgoersgoestgoethgoetygofergoffsgoggagogosgoiergojisgoldsgoldygolesgolfsgolpegolpsgombogomergompagonchgonefgongsgoniagonifgonksgonnagonofgonysgonzogoobygoodsgoofsgoogsgooksgookygooldgoolsgoolygoonsgoonygoopsgoopygoorsgoorygoosygopakgopikgoralgorasgoredgoresgorisgormsgormygorpsgorsegorsygoshtgossegotchgothsgothygottagouchgouksgouragoutsgoutygowangowdsgowfsgowksgowlsgownsgoxesgoyimgoylegraalgrabsgradsgraffgraipgramagramegrampgramsgranagransgrapygravsgraysgrebegrebogrecegreekgreesgregegregogreingrensgresegrevegrewsgreysgricegridegridsgriffgriftgrigsgrikegrinsgriotgripsgriptgripygrisegristgrisygrithgritsgrizegroatgrodygrogsgroksgromagronegroofgroszgrotsgroufgrovygrowsgrrlsgrrrlgrubsgruedgruesgrufegrumegrumpgrundgrycegrydegrykegrypegryptguacoguanaguanoguansguarsgucksguckygudesguffsgugasguidsguimpguirogulaggulargulasgulesguletgulfsgulfygullsgulphgulpsgulpygummagummigumpsgundygungegungygunksgunkygunnyguqingurdygurgegurlsgurlygurnsgurrygurshgurusgushyguslaguslegusligussygustsgutsyguttaguttyguyedguyleguyotguysegwinegyalsgyansgybedgybesgyeldgympsgynaegyniegynnygynosgyozagyposgyppogyppygyralgyredgyresgyrongyrosgyrusgytesgyvedgyveshaafshaarshablehabushacekhackshadalhadedhadeshadjihadsthaemshaetshaffshafizhaftshaggshahashaickhaikahaikshaikuhailshailyhainshainthairshaithhajeshajishajjihakamhakashakeahakeshakimhakushalalhaledhalerhaleshalfahalfshalidhallohallshalmahalmshalonhaloshalsehaltshalvahalwahamalhambahamedhameshammyhamzahanaphancehanchhandshangihangshankshankyhansahansehantshaolehaomahapaxhaplyhappihapusharamhardsharedharesharimharksharlsharmsharnsharosharpshartshashyhaskshaspshastahatedhateshathahaudshaufshaughhauldhaulmhaulshaulthaunshausehaverhaveshawedhawkshawmshawsehayedhayerhayeyhaylehazanhazedhazerhazesheadshealdhealsheameheapsheapyhearehearsheastheatshebenhebeshechtheckshederhedgyheedsheedyheelsheezehefteheftsheidsheighheilsheirshejabhejraheledhelesheliohellshelmsheloshelothelpshelvehemalhemeshemicheminhempshempyhenchhendshengehennahennyhenryhentsheparherbsherbyherdsheresherlshermahermshernsherosherryhersehertzheryehespshestsheteshethsheuchheughheveahewedhewerhewghhexadhexedhexerhexeshexylheyedhianthickshidedhiderhideshiemshighshighthijabhijrahikedhikerhikeshikoihilarhilchhillohillshiltshilumhilushimbohinauhindshingshinkyhinnyhintshioishiplyhiredhireehirerhireshissyhistshithehivedhiverhiveshizenhoaedhoagyhoarshoaryhoasthoboshockshocushodadhodjahoershoganhogenhoggshoghshohedhoickhoiedhoikshoinghoisehokashokedhokeshokeyhokishokkuhokumholdsholedholesholeyholkshollaholloholmeholmsholonholosholtshomashomedhomeshomeyhomiehommehomoshonanhondahondshonedhonerhoneshongihongshonkshonkyhoochhoodshoodyhooeyhoofshookahookshookyhoolyhoonshoopshoordhoorshooshhootshootyhoovehopakhopedhoperhopeshoppyhorahhoralhorashorishorkshormehornshorsthorsyhosedhoselhosenhoserhoseshoseyhostahostshotchhotenhottyhouffhoufshoughhourihourshoutshoveahovedhovenhoveshowbehoweshowffhowfshowkshowlshowrehowsohoxedhoxeshoyashoyedhoylehubbyhuckshudnahududhuershuffshuffyhugerhuggyhuhushuiashulashuleshulkshulkyhullohullshullyhumashumfshumichumpshumpyhunkshuntshurdshurlshurlyhurrahursthurtshushyhuskshusoshutiahuzzahuzzyhwylshydrahyenshyggehyinghykeshylashyleghyleshylichymnshyndehyoidhypedhypeshyphahyphyhyposhyraxhysonhytheiambiiambsibrikicersichedichesichoricierickerickleiconsictalicticictusidantideasideesidentidledidlesidolaidolsidylsiftarigapoiggediglusihramikansikatsikonsileacilealileumileusiliadilialiliumillerillthimagoimamsimariimaumimbarimbedimideimidoimidsimineiminoimmewimmitimmiximpedimpisimpotimproimshiimshyinaptinarminbyeincelincleincogincusincutindewindiaindieindolindowindriindueinerminfixinfosinfrainganingleinioninkedinkerinkleinnedinnitinorbinruninsetinspointelintilintisintrainulainureinurninustinvarinwitiodiciodidiodiniotasipponiradeiridsiringirkedirokoironeironsisbasishesisledislesisnaeisseiistleitemsitheriviediviesixiasixnayixoraixtleizardizarsizzatjaapsjabotjacaljacksjackyjadedjadesjafasjaffajagasjagerjaggsjaggyjagirjagrajailsjakerjakesjakeyjalapjalopjambejambojambsjambujamesjammyjamonjanesjannsjannyjantyjapanjapedjaperjapesjarksjarlsjarpsjartajaruljaseyjaspejaspsjatosjauksjaupsjavasjaveljawanjawedjaxiejeansjeatsjebeljedisjeelsjeelyjeepsjeersjeezejefesjeffsjehadjehusjelabjellojellsjembejemmyjennyjeonsjeridjerksjerryjessejestsjesusjetesjetonjeunejewedjewiejhalajiaosjibbajibbsjibedjiberjibesjiffsjiggyjigotjihadjillsjiltsjimmyjimpyjingojinksjinnejinnijinnsjirdsjirgajirrejismsjivedjiverjivesjiveyjnanajobedjobesjockojocksjockyjocosjodeljoeysjohnsjoinsjokedjokesjokeyjokoljoledjolesjollsjoltsjoltyjomonjomosjonesjongsjontyjooksjoramjorumjotasjottyjotunjoualjougsjouksjoulejoursjowarjowedjowlsjowlyjoyedjubasjubesjucosjudasjudgyjudosjugaljugumjujusjukedjukesjukusjulepjumarjumbyjumpsjuncojunksjunkyjupesjuponjuraljuratjureljuresjustsjutesjuttyjuvesjuviekaamakababkabarkabobkachakackskadaikadeskadiskafirkagoskaguskahalkaiakkaidskaieskaifskaikakaikskailskaimskaingkainskakaskakiskalamkaleskalifkaliskalpakamaskameskamikkamiskammekanaekanaskandykanehkaneskangakangskanjikantskanzukaonskapaskaphskapokkapowkapuskaputkaraskaratkarkskarnskarookaroskarrikarstkarsykartskarzykashakasmekatalkataskatiskattikaughkaurikaurukaurykavalkavaskawaskawaukawedkaylekayoskaziskazookbarskebarkebobkeckskedgekedgykeechkeefskeekskeelskeemakeenokeenskeepskeetskeevekefirkehuakeirskelepkelimkellskellykelpskelpykeltskeltykembokembskempskemptkempykenafkenchkendokenoskentekentskepiskerbskerelkerfskerkykermakernekernskeroskerrykervekesarkestsketasketchketesketolkevelkevilkexeskeyedkeyerkhadikhafskhanskhaphkhatskhayakhazikhedakhethkhetskhojakhorskhoumkhudskiaatkiackkiangkibbekibbikibeikibeskiblakickskickykiddokiddykidelkidgekiefskierskievekievskightkikeskikoikileykilimkillskilnskiloskilpskiltskiltykimbokinaskindakindskindykineskingskininkinkskinoskiorekipeskippakippskirbykirkskirnskirrikisankissykistskitedkiterkiteskithekithskitulkivaskiwisklangklapsklettklickkliegkliksklongkloofklugeklutzknagsknapsknarlknarsknaurknawekneesknellknishknitskniveknobsknopsknospknotsknoutknoweknowsknubsknurlknurrknursknutskoanskoapskobankoboskoelskoffskoftakogalkohaskohenkohlskoinekojiskokamkokaskokerkokrakokumkolaskoloskombukonbukondokonkskookskookykoorikopekkophskopjekoppakoraikoraskoratkoreskormakoroskorunkoruskoseskotchkotoskotowkourakraalkrabskraftkraiskraitkrangkranskranzkrautkrayskreepkrengkrewekronakronekroonkrubikrunkksarskubiekudoskuduskudzukufiskugelkuiaskukrikukuskulakkulankulaskulfikumiskumyskuriskurrekurtakuruskussokutaskutchkutiskutuskuzuskvasskvellkwelakyackkyakskyangkyarskyatskyboskydstkyleskyliekylinkylixkyloekyndekyndskypeskyriekyteskythelaarilabdalabialabislabralacedlacerlaceslacetlaceylacksladdyladedladerladeslaerslaevolaganlahallaharlaichlaicslaidslaighlaikalaikslairdlairslairylaithlaitylakedlakerlakeslakhslakinlaksalaldylallslamaslambslambylamedlamerlameslamialammylampslanailanaslanchlandelandslaneslankslantslapinlapislapjelarchlardslardylareelareslargolarislarkslarkylarnslarntlarumlasedlaserlaseslassilassulassylastslatahlatedlatenlatexlathilathslathylatkelatuslauanlauchlaudslaufslaundlauralavallavaslavedlaverlaveslavralavvylawedlawerlawinlawkslawnslawnylaxedlaxerlaxeslaxlylayedlayinlayuplazarlazedlazeslazoslazzilazzoleadsleadyleafsleaksleamsleansleanyleapslearelearslearyleatsleavyleazelebenleccyledesledgyledumleearleeksleepsleersleeseleetsleezelefteleftslegerlegesleggeleggolegitlehrslehualeirsleishlemanlemedlemellemeslemmalemmelendsleneslengslenislenoslenselentilentoleonelepidlepraleptaleredlereslerpslesboleseslestsletchletheletupleuchleucoleudsleughlevasleveeleveslevinlevislewislexeslexislezeslezzalezzylianalianeliangliardliarsliartliberlibralibrilichilichtlicitlickslidarlidosliefslienslierslieuslieveliferlifesliftsliganligerliggelignelikedlikerlikeslikinlillslilosliltslimanlimaslimaxlimbalimbilimbslimbylimedlimenlimeslimeylimmalimnslimoslimpalimpslinaclinchlindslindylinedlineslineylingalingslingylininlinkslinkylinnslinnylinoslintslintylinumlinuxlionslipaslipeslipinliposlippyliraslirkslirotliskslislelispslistslitailitaslitedliterliteslitholithslitrelivedlivenliveslivorlivrellanoloachloadsloafsloamsloansloastloavelobarlobedlobesloboslobuslochelochslocielocislockslocoslocumlodenlodesloessloftsloganlogesloggylogialogielogoilogonlogoslohanloidsloinsloipeloirslokeslollslollylologlomaslomedlomeslonerlongalongelongsloobylooedlooeyloofaloofslooielookslookyloomsloonsloonyloopsloordlootslopedloperlopesloppyloralloranlordslordylorelloresloriclorislosedlosellosenloseslossylotahlotaslotesloticlotoslotsalottalottelottolotuslouedloughlouielouisloumaloundlounsloupeloupslourelourslouryloutslovatlovedlovesloveylovielowanlowedloweslowndlownelownslowpslowrylowselowtsloxedloxeslozenluachluauslubedlubeslubralucesluckslucreludesludicludosluffaluffslugedlugerlugeslullsluluslumaslumbilummelummylumpslunasluneslunetlungilungslunksluntslupinluredlurerlureslurexlurgilurgylurkslurrylurveluserlushyluskslustslususlutealutedluterlutesluvvyluxedluxerluxeslweislyamslyardlyartlyaselycealyceelycralymeslyneslyreslysedlyseslysinlysislysollyssalytedlyteslythelyticlyttamaaedmaaremaarsmabesmacasmacedmacermacesmachemachimachsmacksmaclemaconmadgemadidmadremaerlmaficmagesmaggsmagotmagusmahoemahuamahwamaidsmaikomaiksmailemaillmailsmaimsmainsmairemairsmaisemaistmakarmakesmakismakosmalammalarmalasmalaxmalesmalicmalikmalismallsmalmsmalmymaltsmaltymalusmalvamalwamamasmambamameemameymamiemanasmanatmandimanebmanedmanehmanesmanetmangsmanismankymannamanosmansemantamantomantymanulmanusmapaumaquimaraemarahmarasmarcsmardymaresmargemargsmariamaridmarkamarksmarlemarlsmarlymarmsmaronmarormarramarrimarsemartsmarvymasasmasedmasermasesmashymasksmassamassymastsmastymasusmataimatedmatermatesmathsmatinmatlomattemattsmatzamatzomaubymaudsmaulsmaundmaurimausymautsmauzymavenmaviemavinmavismawedmawksmawkymawnsmawrsmaxedmaxesmaxismayanmayasmayedmayosmaystmazedmazermazesmazeymazutmbirameadsmealsmeanemeansmeanymearemeasemeathmeatsmebosmechsmecksmediimedlemeedsmeersmeetsmeffsmeinsmeintmeinymeithmekkamelasmelbameldsmelicmelikmellsmeltsmeltymemesmemosmenadmendsmenedmenesmengemengsmensamensemenshmentamentomenusmeousmeowsmerchmercsmerdemeredmerelmerermeresmerilmerismerksmerlemerlsmersemesalmesasmeselmesesmeshymesicmesnemesonmessymestometedmetesmethomethsmeticmetifmetismetolmetremeusemevedmevesmewedmewlsmeyntmezesmezzemezzomhorrmiaoumiaowmiasmmiaulmicasmichemichtmicksmickymicosmicramiddymidgymidismiensmievemiffsmiffymiftymiggsmihasmihismikedmikesmikramikvamilchmildsmilermilesmilfsmiliamilkomilksmillemillsmilormilosmilpamiltsmiltymiltzmimedmimeomimermimesmimsyminaeminarminasmincymindsminedminesmingemingsmingyminisminkeminksminnyminosmintsmiredmiresmirexmiridmirinmirksmirkymirlymirosmirvsmirzamischmisdomisesmisgomisosmissamistsmistymitchmitermitesmitismitremittsmixedmixenmixermixesmixtemixupmizenmizzymnememoansmoatsmobbymobesmobeymobiemoblemochimochsmochymocksmodermodesmodgemodiimodusmoersmofosmoggymohelmohosmohrsmohuamohurmoilemoilsmoiramoiremoitsmojosmokesmokismokosmolalmolasmoldsmoledmolesmollamollsmollymoltomoltsmolysmomesmommamommymomusmonadmonalmonasmondemondomonermongomongsmonicmoniemonksmonosmontemontymoobsmoochmoodsmooedmooksmoolamoolimoolsmoolymoongmoonsmoonymoopsmoorsmoorymootsmoovemopedmopermopesmopeymoppymopsymopusmoraemorasmoratmoraymorelmoresmoriamornemornsmorramorromorsemortsmosedmosesmoseymosksmossomostemostsmotedmotenmotesmotetmoteymothsmothymotismottemottsmottymotusmotzamouchmouesmouldmoulsmoupsmoustmousymovedmovesmowasmowedmowramoxasmoxiemoyasmoylemoylsmozedmozesmozosmpretmuchomucicmucidmucinmucksmucormucromudgemudirmudramuffsmuftimuggamuggsmuggymuhlymuidsmuilsmuirsmuistmujikmulctmuledmulesmuleymulgamuliemullamullsmulsemulshmummsmumpsmumsymumusmungamungemungomungsmunismuntsmuntumuonsmurasmuredmuresmurexmuridmurksmurlsmurlymurramurremurrimurrsmurrymurtimurvamusarmuscamusedmusermusesmusetmushamusitmusksmusosmussemussymusthmustsmutchmutedmutermutesmuthamutismutonmuttsmuxedmuxesmuzakmuzzymvulemyallmylarmynahmynasmyoidmyomamyopemyopsmyopymysidmythimythsmythymyxosmzeesnaamsnaansnabesnabisnabksnablanabobnachenachonacrenadasnaevenaevinaffsnagasnaggynagornahalnaiadnaifsnaiksnailsnairanairunakednakernakfanalasnalednallanamednamernamesnammanamusnanasnancenancynandunannananosnanuanapasnapednapesnapoonappanappenappynarasnarconarcsnardsnaresnaricnarisnarksnarkynarrenashinatchnatesnatisnattynauchnauntnavarnavesnavewnavvynawabnazesnazirnazisndujaneafenealsneapsnearsneathneatsnebeknebelnecksneddyneedsneeldneeleneembneemsneepsneeseneezenegronegusneifsneistneivenelisnellynemasnemnsnemptnenesneonsnepernepitneralnerdsnerkanerksnerolnertsnertznervynestsnetesnetopnettsnettyneuksneumeneumsnevelnevesnevusnewbsnewednewelnewienewsynewtsnextsnexusngaionganangatingomangweenicadnichtnicksnicolnidalnidednidesnidornidusniefsnievenifesniffsniffyniftynigernighsnihilnikabnikahnikaunillsnimbinimbsnimpsninerninesninonnipasnippyniqabnirlsnirlyniseinissenisusniternitesnitidnitonnitrenitronitrynittynivalnixednixernixesnixienizamnkosinoahsnobbynocksnodalnoddynodesnodusnoelsnoggsnohownoilsnoilynointnoirsnolesnollsnolosnomasnomennomesnomicnomoinomosnonasnoncenonesnonetnongsnonisnonnynonylnoobsnooitnooksnookynoonsnoopsnopalnorianorisnorksnormanormsnosednosernosesnotalnotednoternotesnotumnouldnoulenoulsnounsnounynoupsnovaenovasnovumnowaynowednowlsnowtsnowtynoxalnoxesnoyaunoyednoyesnubbynubianuchanuddynudernudesnudienudzhnuffsnugaenukednukesnullanullsnumbsnumennummynunnynurdsnurdynurlsnurrsnutsonutsynyaffnyalanyingnyssaoakedoakeroakumoaredoasesoasisoastsoatenoateroathsoavesobangobeahobeliobeysobiasobiedobiitobitsobjetoboesoboleoboliobolsoccamocherochesochreochryockerocreaoctadoctanoctasoctyloculiodahsodalsodeonodeumodismodistodiumodorsodourodyleodylsofaysoffedoffieoflagofterogamsogeedogeesogginoghamogiveogledogleroglesogmicogresohiasohingohmicohoneoidiaoiledoileroinksointsojimeokapiokaysokehsokrasoktasoldieoleicoleinolentoleosoleumoliosollasollavollerollieologyolpaeolpesomasaomberombusomensomersomitsomlahomovsomrahonceroncesoncetoncusonelyonersoneryoniumonkusonlayonnedonticoobitoohedoomphoontsoopedoorieoosesootidoozedoozesopahsopalsopensopepeopingopposopsinoptedopterorachoracyoralsorangorantorateorbedorcasorcinordosoreadorfesorgiaorgicorgueoribiorielorixaorlesorlonorlopormerornisorpinorrisorthoorvalorzososcaroshacosierosmicosmolossiaostiaotakuotaryottarottosoubitouchtouensouijaoulksoumasoundyoupasoupedoupheouphsourieouseloustsoutbyoutedoutreoutroouttaouzelouzosovalsovelsovensoversovistovoliovoloovuleowcheowiesowledowlerowletownedowresowrieowsenoxbowoxersoxeyeoxidsoxiesoximeoximsoxlipoxteroyersozekiozziepaalspaanspacaspacedpacerpacespaceypachapackspacospactapactspadispadlepadmapadrepadripaeanpaedopaeonpagedpagerpagespaglepagodpagripaikspailspainspairepairspaisapaisepakkapalaspalaypaleapaledpalespaletpalispalkipallapallspallypalmspalmypalpipalpspalsapampapanaxpancepandapandspandypanedpanespangapangspanimpankopannepannipantopantspantypaolipaolopapaspapawpapespappipappyparaeparasparchpardipardspardyparedparenpareoparespareuparevpargepargoparisparkiparksparkyparleparlyparmaparolparpsparraparrspartipartsparveparvopaseopasespashapashmpaskapaspypassepastspatedpatenpaterpatespathspatinpatkapatlypattepatuspauaspaulspavanpavedpavenpaverpavespavidpavinpavispawaspawawpawedpawerpawkspawkypawlspawnspaxespayedpayorpaysdpeagepeagspeakspeakypealspeanspearepearspeartpeasepeatspeatypeavypeazepebaspechspeckepeckspeckypedespedispedropeecepeekspeelspeenspeeoypeepepeepspeerspeerypeevepeggypeghspeinspeisepeizepekanpekespekinpekoepelaspelaupelespelfspellspelmapelonpeltapeltspendspendupenedpenespengopeniepenispenkspennapennipentspeonspeonypeplapepospeppypepsiperaipercepercsperduperdypereaperesperisperkspermspernsperogperpsperryperseperstpertspervepervopervspervypesospestspestypetarpeterpetitpetrepetripettipettopeweepewitpeysephagephangpharepharmpheerphenepheonphesephialphishphizzphloxphocaphonophonsphotsphphtphutsphylaphylepianipianspibalpicalpicaspiccypickspicotpicrapiculpiendpierspiertpietapietspiezopightpigmypiingpikaspikaupikedpikerpikespikeypikispikulpilaepilafpilaopilarpilaupilawpilchpileapiledpileipilerpilespilispillspilowpilumpiluspimaspimpspinaspinedpinespingopingspinkopinkspinnapinnypinonpinotpintapintspinuppionspionypiouspioyepioyspipalpipaspipedpipespipetpipispipitpippypipulpiraipirlspirnspirogpiscopisespiskypisospissypistepitaspithspitonpitotpittapiumspixespizedpizesplaasplackplageplansplapsplashplasmplastplatsplattplatyplayaplayspleasplebeplebsplenapleonpleshplewsplicapliesplimsplingplinkploatplodsplongplonkplookplopsplotsplotzploukplowsployeployspluespluffplugsplumsplumypluotplutoplyerpoachpoakapoakepoboypockspockypodalpoddypodexpodgepodgypodiapoemspoepspoetspogeypoggepogospohedpoilupoindpokalpokedpokespokeypokiepoledpolerpolespoleypoliopolispoljepolkspollspollypolospoltspolyspombepomespommypomospompsponceponcypondsponesponeypongapongopongspongyponkspontspontyponzupoodspooedpoofspoofypoohspoojapookapookspoolspoonspoopspoopypooripoortpootspoovepoovypopespoppapopsyporaeporalporedporerporesporgeporgyporinporksporkypornopornspornyportaportsportyposedposesposeyposhopostspotaepotchpotedpotespotinpotoopotsypottopottspottypouffpoufspoukepoukspoulepoulppoultpoupepouptpourspoutspowanpowinpowndpownspownypowrepoxedpoxespoyntpoyoupoysepozzypraampradsprahupramspranaprangpraosprasepratepratsprattpratyprausprayspredypreedpreespreifpremspremyprentpreonpreopprepspresapreseprestpreveprexypreysprialpricypriefprierpriesprigsprillprimaprimiprimpprimsprimyprinkprionpriseprissproasprobsprodsproemprofsprogsproinprokeproleprollpromopromspronkpropsproreprosoprossprostprosyprotoproulprowsproynpruntprutapryerprysepseudpshawpsionpsoaepsoaipsoaspsorapsychpsyoppubcopubespubispucanpucerpucespuckapuckspuddypudgepudicpudorpudsypuduspuerspuffapuffspuggypugilpuhaspujahpujaspukaspukedpukerpukespukeypukkapukuspulaopulaspuledpulerpulespulikpulispulkapulkspullipullspullypulmopulpspuluspumaspumiepumpspunaspuncepungapungspunjipunkapunkspunkypunnypuntopuntspuntypupaepupaspupuspurdapuredpurespurinpurispurlspurpypurrspursypurtypusespuslepussyputidputonputtiputtoputtspuzelpwnedpyatspyetspygalpyinspylonpynedpynespyoidpyotspyralpyranpyrespyrexpyricpyrospyxedpyxespyxiepyxispzazzqadisqaidsqajaqqanatqapikqiblaqophsqormaquadsquaffquagsquairquaisquakyqualequantquarequassquatequatsquaydquaysqubitqueanquemequenaquernqueynqueysquichquidsquiffquimsquinaquinequinoquinsquintquipoquipsquipuquirequirtquistquitsquoadquodsquoifquoinquoitquollquonkquopsqurshquyterabatrabicrabisracedracesracheracksraconradgeradixradonraffsraftsragasragderagedrageeragerragesraggaraggsraggyragisragusrahedrahuiraiasraidsraiksrailerailsrainerainsrairdraitaraitsrajasrajesrakedrakeerakerrakesrakiarakisrakusralesramalrameerametramieraminramisrammyrampsramusranasrancerandsraneerangarangirangsrangyranidranisrankeranksrantsrapedraperrapesrapherapperaredrareeraresrarksrasedraserrasesraspsrasserastaratalratanratasratchratedratelraterratesratharatherathsratooratosratusraunsrauporavedravelraverravesraveyravinrawerrawinrawlyrawnsraxedraxesrayahrayasrayedrayleraynerazedrazeerazerrazesrazooreaddreadsreaisreaksrealorealsreamereamsreamyreansreapsrearsreastreatareatereaverebberebecrebidrebitreboprebuyrecalreccereccoreccyrecitrecksreconrectarectirectoredanreddsreddyrededredesrediaredidredipredlyredonredosredoxredryredubreduxredyereechreedereedsreefsreefyreeksreekyreelsreensreestreeverefedrefelrefforefisrefixreflyrefryregarregesreggoregieregmaregnaregosregurrehemreifsreifyreikireiksreinkreinsreirdreistreiverejigrejonrekedrekesrekeyreletrelierelitrelloremanremapremenremetremexremixrenayrendsreneyrengarenigreninrennerenosrenterentsreoilreorgrepegrepinreplareposrepotreppsreproreranrerigresatresawresayreseeresesresewresidresitresodresowrestorestsrestyresusretagretaxretemretiaretieretoxrevetrevierewanrewaxrewedrewetrewinrewonrewthrexesrezesrheasrhemerheumrhiesrhimerhinerhodyrhombrhonerhumbrhynerhytariadsrialsriantriataribasribbyribesricedricerricesriceyrichtricinricksridesridgyridicrielsriemsrieveriferriffsrifteriftsriftyriggsrigolriledrilesrileyrillerillsrimaerimedrimerrimesrimusrindsrindyrinesringsrinksriojariotsripedripesrippsrisesrishirisksrispsrisusritesrittsritzyrivasrivedrivelrivenrivesriyalrizasroadsroamsroansroarsroaryroaterobedrobesroblerocksrodedrodesroguyrohesroidsroilsroilyroinsroistrojakrojisrokedrokerrokesrolagrolesrolfsrollsromalromanromeorompsronderondoroneoronesroninronneronterontsroodsroofsroofyrooksrookyroomsroonsroopsroopyroosarooserootsrootyropedroperropesropeyroqueroralroresroricroridrorierortsrortyrosedrosesrosetroshirosinrositrostirostsrotalrotanrotasrotchrotedrotesrotisrotlsrotonrotosrotterouenrouesrouleroulsroumsroupsroupyroustrouthroutsrovedrovenrovesrowanrowedrowelrowenrowierowmerowndrowthrowtsroyneroystrozetrozitruanarubairubbyrubelrubesrubinrublerublirubusrucherucksrudasruddsrudesrudierudisruedaruersrufferuffsrugaerugalruggyruingruinsrukhsruledrulesrumalrumborumenrumesrumlyrummyrumporumpsrumpyrunchrundsrunedrunesrungsrunicrunnyruntsruntyrupiarurpsrurusrusasrusesrushyrusksrusmarusserustsruthsrutinruttyryalsrybatrykedrykesrymmeryndsryotsrypersaagssabalsabedsabersabessabhasabinsabirsablesabotsabrasabresackssacrasaddosadessadhesadhusadissadossadzasafedsafessagassagersagessaggysagossagumsahebsahibsaicesaicksaicssaidssaigasailssaimssainesainssairssaistsaithsajousakaisakersakessakiasakissaktisalalsalatsalepsalessaletsalicsalixsallesalmisalolsalopsalpasalpssalsesaltosaltssaluesalutsamansamassambasambosameksamelsamensamessameysamfusammysampisampssandssanedsanessangasanghsangosangssankosansasantosantssaolasapansapidsaporsaransardssaredsareesargesargosarinsarissarkssarkysarodsarossarussasersasinsassesataisataysatedsatemsatessatissaubasauchsaughsaulssaultsauntsaurysautssavedsaversavessaveysavinsawahsawedsawersaxessayedsayersayidsaynesayonsaystsazesscabsscadsscaffscagsscailscalascallscamsscandscansscapascapescapiscarpscarsscartscathscatsscattscaudscaupscaurscawssceatscenascendschavschmoschulschwasclimscodyscogsscoogscootscopascopsscotsscougscoupscowpscowsscrabscraescragscranscratscrawscrayscrimscripscrobscrodscrogscrowscudiscudoscudsscuffscuftscugssculkscullsculpsculsscumsscupsscurfscursscusescutascutescutsscuzzscyessdaynsdeinsealsseameseamsseamyseanssearesearsseaseseatsseazesebumseccosechssectssedersedessedgesedgysedumseedsseeksseeldseelsseelyseemsseepsseepyseerssefersegarsegnisegnosegolsegossehriseifsseilsseineseirsseiseseismseityseizasekossektsselahselesselfssellasellesellsselvasemeesemessemiesemissenassendssenessengisennasenorsensasensisentesentisentssenvysenzasepadsepalsepicsepoyseptaseptsseracseraiseralseredsererseresserfssergesericserinserksseronserowserraserreserrsserryservoseseysessasetaesetalsetonsettssewansewarsewedsewelsewensewinsexedsexersexessextosextsseyenshadsshagsshahsshakoshaktshalmshalyshamashamsshandshansshapssharnshashshaulshawmshawnshawsshayashaysshchisheafshealsheasshedssheelshendshentsheolsherdsheresheroshetsshevashewnshewsshiaishielshiershiesshillshilyshimsshinsshipsshirrshirsshishshisoshistshiteshitsshiurshivashiveshivsshlepshlubshmekshmoeshoatshoedshoershoesshogishogsshojishojosholashoolshoonshoosshopeshopsshorlshoteshotsshottshowdshowsshoyushredshrisshrowshtikshtumshtupshuleshulnshulsshunsshurashuteshutsshwasshyersialssibbssibylsicessichtsickosickssickysidassidedsidersidessidhasidhesidlesieldsienssientsiethsieursiftssighssigilsiglasignasignssijossikassikersikessildssiledsilensilersilessilexsilkssillssilossiltssiltysilvasimarsimassimbasimissimpssimulsindssinedsinessingssinhssinkssinkysinussipedsipessippysiredsireesiressirihsirissirocsirrasirupsisalsisessistasistssitarsitedsitessithesitkasitupsitussiversixersixessixmosixtesizarsizedsizelsizersizesskagsskailskaldskankskartskatsskattskawsskeanskearskedsskeedskeefskeenskeerskeesskeetskeggskegsskeinskelfskellskelmskelpskeneskensskeosskepsskerssketsskewsskidsskiedskiesskieyskimoskimsskinkskinsskintskiosskipsskirlskirrskiteskitsskiveskivysklimskoalskodyskoffskogsskolsskoolskortskoshskranskrikskuasskugsskyedskyerskyeyskyfsskyreskyrsskyteslabssladeslaesslagsslaidslakeslamsslaneslankslapsslartslatsslatyslawsslaysslebssledssleerslewssleysslierslilyslimsslipeslipssliptslishslitsslivesloanslobssloesslogssloidslojdslomosloomslootslopsslopyslormslotssloveslowssloydslubbslubssluedsluessluffslugssluitslumsslurbslurssluseslutsslyerslypesmaaksmaiksmalmsmaltsmarmsmazesmeeksmeessmeiksmekesmerksmewssmirrsmirssmitssmogssmokosmoltsmoorsmootsmoresmorgsmoutsmowtsmugssmurssmushsmutssnabssnafusnagssnapssnarfsnarksnarssnarysnashsnathsnawssneadsneapsnebssnecksnedssneedsneessnellsnibssnicksniessniftsnigssnipssnipysnirtsnitssnobssnodssnoeksnoepsnogssnokesnoodsnooksnoolsnootsnotssnowksnowssnubssnugssnushsnyessoakssoapssoaresoarssoavesobassocassocessockosockssoclesodassoddysodicsodomsofarsofassoftasoftssoftysogersohursoilssoilysojassojussokahsokensokessokolsolahsolansolassoldesoldisoldosoldssoledsoleisolersolessolonsolossolumsolussomansomassoncesondesonessongssonlysonnesonnysonsesonsysooeysookssookysoolesoolssoomssoopssootesootssophssophysoporsoppysoprasoralsorassorbosorbssordasordosordssoredsoreesorelsorersoressorexsorgosornssorrasortasortssorussothssotolsoucesouctsoughsoukssoulssoumssoupssoupysourssousesoutssowarsowcesowedsowffsowfssowlesowlssowmssowndsownesowpssowsesowthsoyassoylesoyuzsozinspacyspadospaedspaerspaesspagsspahispailspainspaitspakespaldspalespallspaltspamsspanespangspansspardsparsspartspatespatsspaulspawlspawsspaydspaysspazaspazzspealspeanspeatspecsspectspeelspeerspeilspeirspeksspeldspelkspeosspetsspeugspewsspewyspialspicaspickspicsspidespierspiesspiffspifsspiksspilespimsspinaspinkspinsspirtspiryspitsspitzspivssplaysplogspodespodsspoomspoorspootsporksposhspotsspradspragspratspredsprewspritsprodsprogspruesprugspudsspuedspuerspuesspugsspulespumespumyspurssputaspyalspyresquabsquawsquegsquidsquitsquizstabsstadestagsstagystaigstanestangstaphstapsstarnstarrstarsstatsstaunstawsstayssteanstearsteddstedestedssteeksteemsteensteilstelastelestellstemestemsstendstenostensstentstepssteptsterestetsstewsstewysteysstichstiedstiesstilbstilestimestimsstimystipastipestirestirkstirpstirsstivestivystoaestoaistoasstoatstobsstoepstogystoitstolnstomastondstongstonkstonnstookstoorstopestopsstoptstossstotsstottstounstoupstourstownstowpstowsstradstraestragstrakstrepstrewstriastrigstrimstropstrowstroystrumstubsstudestudsstullstulmstummstumsstunsstupastupesturesturtstyedstyesstylistylostymestymystyrestytesubahsubassubbysubersubhasuccisuckssuckysucresuddssudorsudsysuedesuentsuerssuetesuetssuetysugansughssugossuhursuidssuintsuitssujeesukhssukuksulcisulfasulfosulkssulphsulussumissummasumossumphsumpssunissunkssunnasunnssunupsupessuprasurahsuralsurassuratsurdssuredsuressurfssurfysurgysurrasusedsusessusussutorsutrasuttaswabsswackswadsswageswagsswailswainswaleswalyswamyswangswankswansswapsswaptswardswareswarfswartswatsswaylswaysswealswedesweedsweelsweersweessweirsweltswerfsweysswiesswigsswileswimsswinkswipeswireswissswithswitsswiveswizzswobsswoleswolnswopsswoptswotsswounsybbesybilsyboesybowsyceesycessyconsyenssykersykessylissylphsylvasymarsynchsyncssyndssynedsynessynthsypedsypessyphssyrahsyrensysopsythesyvertaalstaatatabertabestabidtabistablatabortabuntabustacantacestacettachetachotachstackstacostactstaelstafiataggytagmatahastahrstaigataigstaikotailstainstairataishtaitstajestakastakestakhitakintakistakkytalaktalaqtalartalastalcstalcytaleatalertalestalkstalkytallstalmatalpataluktalustamaltamedtamestamintamistammytampstanastangatangitangstanhstankatankstankytannatansytantitantotantytapastapedtapentapestapettapistappatapustarastardotaredtarestargatargetarnstaroctaroktarostarpstarretarrytarsitartstartytasartasedtasertasestaskstassatassetassotatartatertatestathstatietatoutattstatustaubetauldtauontaupetautstavahtavastavertawaitawastawedtawertawietawsetawtstaxedtaxertaxestaxistaxoltaxontaxortaxustayratazzatazzeteadeteadsteaedteakstealsteamstearsteatsteazetechstechytectateelsteemsteendteeneteensteenyteersteffsteggsteguategustehrsteiidteilsteindteinstelaetelcotelestelexteliatelictellstellyteloitelostemedtemestempitempstempttemsetenchtendstendutenestengeteniatennetennotennytenontentstentytenuetepaltepastepoyteraiterasterceterekteresterfeterfstergatermsterneternsterrytertsteslatestatesteteststetestethstetratetriteuchteughtewedteweltewittexastexestextsthackthagithaimthalethalithanathanethangthansthanxtharmtharsthawsthawythebethecatheedtheektheesthegntheictheinthelfthemathenstheowthermthespthetethewsthewythigsthilkthillthinethinsthiolthirlthofttholetholithorothorpthousthowlthraethrawthridthripthroethudsthugsthujathunkthurlthuyathymithymytianstiarsticalticcaticedticestichytickstickytiddytidedtidestierstiffstifostiftstigestigontikastikestikistikkatilaktiledtilertilestillstillytilthtiltstimbotimedtimestimontimpstinastincttindstineatinedtinestingetingstinkstinnytintstintytipistippytiredtirestirlstirostirrstitchtitertitistitretittytituptiyintiynstizestizzytoadstoadytoazetockstockytocostoddetoeastoffstoffytoftstofustogaetogastogedtogestoguetohostoiletoilstoingtoisetoitstokaytokedtokertokestokostolantolartolastoledtolestollstollytoltstolustolyltomantombstomestomiatommytomostonditondotonedtonertonestoneytongstonkatonkstonnetonustoolstoomstoonstootstopedtopeetopektopertopestophetophitophstopistopoitopostoppytoquetorahtorantorastorcstorestorictoriitorostorottorrstorsetorsitorsktortatortetortstosastosedtosestoshytossytotedtotertotestottytoukstounstourstousetousytoutstouzetouzytowedtowietownstownytowsetowsytowtstowzetowzytoyedtoyertoyontoyostozedtozestozietrabstradstragitraiktramstranktranqtranstranttrapetrapstrapttrasstratstratttravetrayftraystrecktreedtreentreestrefatreiftrekstrematremstresstresttretstrewstreyftreystriactridetriertriestrifftrigotrigstriketrildtrilltrimstrinetrinstrioltriortriostripstripytristtroadtroaktroattrocktrodetrodstrogstroistroketromptronatronctronetronktronstrooztrothtrotstrowstroystruedtruestrugotrugstrulltryertryketrymatrypstsadetsaditsarstskedtsubatsubotuanstuarttuathtubaetubartubastubbytubedtubestuckstufastuffetuffstuftstuftytugratuiletuinatuismtuktutulestulpatulsitumidtummytumpstumpytunastundstunedtunertunestungstunnytupektupiktupletuqueturdsturfsturfyturksturmeturmsturnsturntturpsturrstushytuskstuskytuteetuttituttytutustuxestuyertwaestwaintwalstwanktwatstwaystweeltweentweeptweertwerktwerptwiertwigstwilltwilttwinktwinstwinytwiretwirptwitetwitstwoertwyertyeestyerstyiyntykestylertympstyndetynedtynestypaltypedtypestypeytypictypostyppstyptotyrantyredtyrestyrostythetzarsudalsudonsugaliuggeduhlanuhuruukaseulamaulansulemaulminulnadulnaeulnarulnasulpanulvasulyieulzieumamiumbelumberumbleumbosumbreumiacumiakumiaqummahummasummedumpedumphsumpieumptyumrahumrasunaisunaptunarmunaryunausunbagunbanunbarunbedunbidunboxuncapuncesunciauncosuncoyuncusundamundeeundosundugunethunfixungagungetungodungotungumunhatunhipunicaunitsunjamunkedunketunkidunlawunlayunledunletunlidunmanunmewunmixunpayunpegunpenunpinunredunridunrigunripunsawunsayunseeunsewunsexunsoduntaxuntinunwetunwitunwonupbowupbyeupdosupdryupendupjetuplayupleduplituppedupranuprunupseeupseyuptakupteruptieuraeiuraliuraosurareurariuraseurateurbexurbiaurdeeurealureasuredoureicurenaurenturgedurgerurgesurialuriteurmanurnalurnedurpedursaeursidursonurubuurvasusersusneausqueusureusuryuteriuvealuveasuvulavacuavadedvadesvagalvagusvailsvairevairsvairyvakasvakilvalesvalisvalsevampsvampyvandavanedvanesvangsvantsvapedvapervapesvaranvarasvardyvarecvaresvariavarixvarnavarusvarvevasalvasesvastsvastyvaticvatusvauchvautevautsvawtevaxesvealevealsvealyveenaveepsveersveeryvegasvegesvegievegosvehmeveilsveilyveinsveinyvelarveldsveldtvelesvellsvelumvenaevenalvendsvenduveneyvengeveninventsvenusverbsverraverryverstvertsvertuvespavestavestsvetchvexedvexervexesvexilvezirvialsviandvibesvibexvibeyvicedvicesvichyviersviewsviewyvifdaviffsvigasvigiavildevilervillivillsvimenvinalvinasvincavinedvinervinesvinewvinicvinosvintsvioldviolsviredvireoviresvirgavirgeviridvirlsvirtuvisasvisedvisesvisievisnevisonvistovitaevitasvitexvitrovittavivasvivatvivdavivervivesvizirvizorvleisvliesvlogsvoarsvocabvocesvoddyvodouvodunvoemavogievoidsvoilevoipsvolaevolarvoledvolesvoletvolksvoltavoltevoltivoltsvolvavolvevomervotedvotesvougevouluvowedvowervoxelvozhdvraicvrilsvroomvrousvrouwvrowsvuggsvuggyvughsvughyvulgovulnsvulvavuttywaacswackewackowackswaddswaddywadedwaderwadeswadgewadiswadtswaffswaftswagedwageswaggawagyuwahoowaidewaifswaiftwailswainswairswaitewaitswakaswakedwakenwakerwakeswakfswaldowaldswaledwalerwaleswaliewaliswalkswallawallswallywaltywamedwameswamuswandswanedwaneswaneywangswankswankywanlewanlywannawantswantywanzewaqfswarbswarbywardswaredwareswarezwarkswarmswarnswarpswarrewarstwartswaseswashywasmswaspswaspywastswatapwattswauffwaughwaukswaulkwaulswaurswavedwaveswaveywawaswaweswawlswaxedwaxerwaxeswayedwazirwazoowealdwealsweambweanswearswebbyweberwechtwedelwedgyweedsweekeweeksweelsweemsweensweenyweepsweepyweestweeteweetswefteweftsweidsweilsweirsweiseweizewekasweldswelkewelkswelktwellswellyweltswembswendswengewennywentsweroswershwestswetaswetlywexedwexeswhamowhamswhangwhapswharewhatawhatswhaupwhaurwhealwhearwheenwheepwheftwhelkwhelmwhenswhetswhewswheyswhidswhiftwhigswhilkwhimswhinswhioswhipswhiptwhirrwhirswhishwhisswhistwhitswhitywhizzwhompwhoofwhootwhopswhorewhorlwhortwhosowhowswhumpwhupswhydawiccawickswickywiddywideswielswifedwifeswifeywifiewiftywiganwiggawiggywikiswilcowildswiledwileswilgawiliswiljawillswiltswimpswindswinedwineswineywingewingswingywinkswinnawinnswinoswinzewipedwiperwipeswiredwirerwireswirrawisedwiseswishawishtwispswistswitanwitedwiteswithewithswithywivedwiverwiveswizenwizeswoadswoaldwockswodgewofulwojuswokerwokkawoldswolfswollywolvewombswombywomynwongawongiwonkswonkywontswoodswooedwoofswoofywooldwoolswoonswoopswoopywoosewooshwootzwordsworkswormswormywortswowedwoweewoxenwrangwrapswraptwrastwratewrawlwrenswrickwriedwrierwrieswritswrokewrootwrothwryerwuddywuduswullswurstwuseswushuwussywuxiawyledwyleswyndswynnswytedwytesxebecxeniaxenicxenonxericxeroxxerusxoanaxraysxylanxylemxylicxylolxylylxystixystsyaarsyabasyabbayabbyyaccayackayacksyaffsyageryagesyagisyahooyairdyakkayakowyalesyamenyampyyamunyangsyanksyapokyaponyappsyappyyarakyarcoyardsyareryarfayarksyarnsyarrsyartayartoyatesyaudsyauldyaupsyawedyaweyyawlsyawnsyawnyyawpsyboreycladycledycondydradydredyeadsyeahsyealmyeansyeardyearsyecchyechsyechyyedesyeedsyeeshyeggsyelksyellsyelmsyelpsyeltsyentayenteyerbayerdsyerksyesesyesksyestsyestyyetisyettsyeuksyeukyyevenyevesyewenyexedyexesyfereyikedyikesyillsyinceyipesyippyyirdsyirksyirrsyirthyitesyitieylemsylikeylkesymoltympesyobboyobbyyocksyodelyodhsyodleyogasyogeeyoghsyogicyoginyogisyoickyojanyokedyokelyokeryokesyokulyolksyolkyyomimyompsyonicyonisyonksyoofsyoopsyoresyorksyorpsyouksyournyoursyourtyouseyowedyowesyowieyowlsyowzayraptyrentyrivdyrnehysameytostyuansyucasyuccayucchyuckoyucksyuckyyuftsyugasyukedyukesyukkyyukosyulanyulesyummoyummyyumpsyuponyuppyyurtayurtsyuzuszabrazackszaidazaidyzairezakatzamanzambozamiazanjazantezanzazanzezappyzarfszariszatiszaxeszayinzazenzealszebeczebubzebuszedaszeinszendozerdazerkszeroszestszetaszexeszezeszhomozibetziffsziganzilaszilchzillazillszimbizimbszincozincszincyzinebzineszingszingyzinkezinkyzippozippyziramzitiszizelzizitzlotezlotyzoaeazoboszobuszoccozoeaezoealzoeaszoismzoistzombizonaezondazonedzonerzoneszonkszooeazooeyzooidzookszoomszoonszootyzoppazoppozorilzoriszorrozoukszoweezowiezuluszupanzupaszuppazurfszuzimzygalzygonzymeszymic";
let ANS = []; for (let i = 0; i < ANSWERS.length; i += 5) ANS.push(ANSWERS.slice(i, i + 5));
let OK = new Set(ANS); for (let i = 0; i < ALLOWED.length; i += 5) OK.add(ALLOWED.slice(i, i + 5));
// ───────── languages: EN built in · FR / ES / DE from wordle-langs.json (5-letter words; FR without accents, ES keeps Ñ, DE keeps Ä Ö Ü) ─────────
const LISTS = { en: { ans: ANS, ok: OK } };
const LANGS = {
  en: { kb: ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"], letters: "abcdefghijklmnopqrstuvwxyz", keep: "" },
  fr: { kb: ["AZERTYUIOP", "QSDFGHJKLM", "WXCVBN"], letters: "abcdefghijklmnopqrstuvwxyz", keep: "" },
  es: { kb: ["QWERTYUIOP", "ASDFGHJKLÑ", "ZXCVBNM"], letters: "abcdefghijklmnopqrstuvwxyzñ", keep: "ñ" },
  de: { kb: ["QWERTZUIOPÜ", "ASDFGHJKLÖÄ", "YXCVBNM"], letters: "abcdefghijklmnopqrstuvwxyzäöü", keep: "äöü" },
};
const LANG_ORDER = ["en", "fr", "es", "de"];
// a typed key → this language's letter (é → e in French, ñ stays in Spanish, ä stays in German), or "" if it isn't one
const keyLetter = (k) => {
  const L = LANGS[G.lang], c = String(k).toLowerCase();
  if (c.length !== 1) return "";
  const n = L.keep.includes(c) ? c : c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return L.letters.includes(n) ? n : "";
};

// ───────── game state (module scope: survives re-renders) ─────────
const ROWS = 6, LEN = 5, FLIP = 260;   // ms between tile flips of a revealed row
const G = { lang: "en", stBy: {}, langLoaded: false, st: null, loaded: false, mode: "daily", practice: null, cur: "", flash: null, shakeAt: 0, revealAt: 0, hideEnd: false, f: 0, dispatch: null };

const bump = () => { G.f++; if (G.dispatch) G.dispatch({ type: "FRAME", f: G.f }); };
const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dayShift = (s, n) => { const [y, m, d] = s.split("-").map(Number); return today(new Date(y, m - 1, d + n)); };
const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const wordFor = (day) => ANS[hash((G.lang === "en" ? "wordle:" : "wordle:" + G.lang + ":") + day) % ANS.length];

const fresh = () => ({ v: 1, day: today(), guesses: [], done: false, won: false, played: 0, wins: 0, streak: 0, maxStreak: 0, lastWin: "", dist: [0, 0, 0, 0, 0, 0], last: "" });

const stFile = () => (G.lang === "en" ? ST_F : `${SUP}/wordle-${G.lang}.json`);
const save = () => {
  if (!G.st) return;
  const b = btoa(unescape(encodeURIComponent(JSON.stringify(G.st)))), F = stFile();
  run(`mkdir -p ${SUP}; echo '${b}' | base64 -D > ${F}.tmp && mv ${F}.tmp ${F}`).catch(() => {});
};

// day rollover: yesterday's result becomes LAST; a skipped or lost day breaks the streak
const rollDay = () => {
  const s = G.st, t = today();
  if (s.day === t) return;
  s.last = s.done ? (s.won ? `${s.guesses.length}/6` : "X/6") : s.guesses.length ? "—" : s.last;
  s.day = t; s.guesses = []; s.done = false; s.won = false;
  if (s.lastWin !== dayShift(t, -1)) s.streak = 0;
  G.cur = ""; G.hideEnd = false; save();
};

const round = () => (G.mode === "practice" && G.practice ? G.practice
  : { word: wordFor(G.st.day), guesses: G.st.guesses, done: G.st.done, won: G.st.won });

// two-pass scoring so double letters are marked like the original: 2 = right spot, 1 = elsewhere, 0 = absent
const score = (guess, word) => {
  const res = [0, 0, 0, 0, 0], left = {};
  for (let i = 0; i < LEN; i++) { if (guess[i] === word[i]) res[i] = 2; else left[word[i]] = (left[word[i]] || 0) + 1; }
  for (let i = 0; i < LEN; i++) if (!res[i] && left[guess[i]]) { res[i] = 1; left[guess[i]]--; }
  return res;
};

const flash = (text, shake) => { G.flash = { text, t: Date.now() }; if (shake) G.shakeAt = Date.now(); bump(); };

const submit = () => {
  const r = round();
  if (r.done) return;
  if (G.cur.length < LEN) { flash("NOT ENOUGH LETTERS", true); return; }
  if (!OK.has(G.cur)) { flash("NOT IN WORD LIST", true); return; }
  r.guesses.push(G.cur); G.cur = ""; G.revealAt = Date.now();
  const won = r.guesses[r.guesses.length - 1] === r.word;
  if (won || r.guesses.length >= ROWS) {
    r.done = true; r.won = won; G.hideEnd = false;
    if (G.mode === "daily") {
      const s = G.st; s.done = true; s.won = won; s.played++;
      if (won) {
        s.wins++; s.dist[s.guesses.length - 1]++;
        s.streak = s.lastWin === dayShift(s.day, -1) ? s.streak + 1 : 1;
        s.lastWin = s.day; s.maxStreak = Math.max(s.maxStreak, s.streak);
      } else s.streak = 0;
    }
  }
  if (G.mode === "daily") save();
  G.flash = null; bump();
};

const press = (k) => {
  const r = round();
  if (r.done) { if (k === "ENTER") startPractice(); return; }   // game over → ⏎ = new word
  if (k === "ENTER") submit();
  else if (k === "DEL") { G.cur = G.cur.slice(0, -1); bump(); }
  else if (keyLetter(k) && G.cur.length < LEN) { G.cur += keyLetter(k); bump(); }
};

const startPractice = () => {
  let w; do { w = ANS[Math.floor(Math.random() * ANS.length)]; } while (w === wordFor(G.st.day));
  G.practice = { word: w, guesses: [], done: false, won: false }; G.mode = "practice"; G.cur = ""; G.hideEnd = false; bump();
};
// switch language: lists come from wordle-langs.json (loaded once), each language keeps its own daily word, state and stats
const setLang = (l) => {
  if (!LANGS[l] || l === G.lang && G.st) return;
  const go = () => {
    if (!LISTS[l]) { flash("WORD LIST MISSING — RUN install.command"); return; }
    if (G.st) G.stBy[G.lang] = G.st;
    G.lang = l; ANS = LISTS[l].ans; OK = LISTS[l].ok; G.mode = "daily"; G.practice = null; G.cur = ""; G.hideEnd = false;
    run(`mkdir -p ${SUP}; echo ${l} > ${LANG_F}`).catch(() => {});
    if (G.stBy[l]) { G.st = G.stBy[l]; rollDay(); bump(); return; }
    G.st = fresh(); bump();
    run(`cat ${stFile()} 2>/dev/null`).then((out) => {
      try { const j = JSON.parse(out); if (G.lang === l) G.st = { ...fresh(), ...j }; } catch (e) {}
      if (G.lang === l) { rollDay(); bump(); }
    }).catch(() => {});
  };
  if (l === "en" || G.langLoaded) return go();
  run(`cat ${DATA_F}`).then((out) => {
    try {
      const d = JSON.parse(out);
      Object.keys(d).forEach((k) => {
        const ans = [], ok = new Set();
        for (let i = 0; i < d[k].ans.length; i += 5) { const w = d[k].ans.slice(i, i + 5); ans.push(w); ok.add(w); }
        for (let i = 0; i < d[k].ok.length; i += 5) ok.add(d[k].ok.slice(i, i + 5));
        LISTS[k] = { ans, ok };
      });
      G.langLoaded = true;
    } catch (e) {}
    go();
  }).catch(() => go());
};
const cycleLang = () => setLang(LANG_ORDER[(LANG_ORDER.indexOf(G.lang) + 1) % LANG_ORDER.length]);
const backToDaily = () => { G.mode = "daily"; G.cur = ""; G.hideEnd = false; bump(); };

const onKey = (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key;
  let used = true;
  if (k === "Enter") press("ENTER");
  else if (k === "Backspace") press("DEL");
  else if (k.length === 1 && keyLetter(k)) press(k);
  else if (k === "Escape") e.currentTarget.blur();
  else used = false;
  if (used) { e.preventDefault(); e.stopPropagation(); }
};

// day change while the widget is open
try { if (window.__wordleTimer) clearInterval(window.__wordleTimer); window.__wordleTimer = setInterval(() => { if (G.st && G.st.day !== today()) { rollDay(); bump(); } }, 30000); } catch (e) {}

// ───────── look ─────────
const BIN = "0110100101110011 1000110101001011 0011101011000101 1101001010010110 0101110100101101 1010011101010010 0110101100101011 1001010111010010 0101101001110101 1100101011010010 0011010110101101 1001011010110100";
const KB = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

const Bracket = ({ pos, color }) => {
  const p = {
    tl: { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2 },
    tr: { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2 },
    bl: { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2 },
    br: { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2 },
  }[pos];
  return <div style={{ position: "absolute", width: 10, height: 10, borderColor: color, borderStyle: "solid", borderWidth: 0, filter: `drop-shadow(0 0 3px ${color})`, ...p }} />;
};

const CSS = () => `
@keyframes wdflip { 0% { transform: rotateX(0) } 45% { transform: rotateX(90deg) } 55% { transform: rotateX(90deg) } 100% { transform: rotateX(0) } }
@keyframes wdpop  { 0% { transform: scale(1) } 50% { transform: scale(1.12) } 100% { transform: scale(1) } }
@keyframes wdshake { 0%,100% { transform: translateX(0) } 20%,60% { transform: translateX(-4px) } 40%,80% { transform: translateX(4px) } }
@keyframes wdblink { 0%,55% { opacity: 1 } 56%,100% { opacity: .25 } }
.wd-board:focus { outline: none }
.wd-key:hover { filter: brightness(1.25) }
.wd-btn:hover { background: ${W_RGBA(C, 0.14)} !important }
`;

const stat = (label, value, color, align) => (
  <div style={{ flex: 1, textAlign: align }}>
    <div style={{ fontSize: 6.5, letterSpacing: 1.2, color: DIM }}>{label}</div>
    <div style={{ fontSize: 11, letterSpacing: 0.5, color: color || T.text, marginTop: 2,
      textShadow: T.glow && color ? `0 0 6px ${color}88` : "none" }}>{value}</div>
  </div>
);

export const render = ({ output }, dispatch) => {
  G.dispatch = dispatch;
  if (/^HIDDEN/.test(output || "")) return <div />;
  const W_L = W_LOAD(output);
  if (W_L.unplaced) return <div />;
  if (!G.loaded && /ST:/.test(output || "")) {
    const m = /ST:(\{.*\})/.exec(output || "");
    try { G.st = m ? { ...fresh(), ...JSON.parse(m[1]) } : fresh(); } catch (e) { G.st = fresh(); }
    G.loaded = true; rollDay();
    const lm = /LANG:(en|fr|es|de)/.exec(output || ""); if (lm && lm[1] !== "en") setTimeout(() => setLang(lm[1]), 0);
  }
  if (!G.st) G.st = fresh();

  const r = round(), s = G.st, practice = G.mode === "practice", now = Date.now();
  const COLS = [W_RGBA(DIM, 0.28), AMBER, C];   // absent · present · correct
  const rowsScored = r.guesses.map((g) => score(g, r.word));
  const revealing = now - G.revealAt < FLIP * LEN + 300;
  // keyboard colours: best state seen per letter (only once its tile has flipped)
  const keyState = {};
  r.guesses.forEach((g, gi) => {
    if (gi === r.guesses.length - 1 && revealing) return;
    g.split("").forEach((ch, i) => { keyState[ch] = Math.max(keyState[ch] === undefined ? -1 : keyState[ch], rowsScored[gi][i]); });
  });
  if (revealing) setTimeout(bump, FLIP * LEN + 320 - (now - G.revealAt));
  const flashing = G.flash && now - G.flash.t < 2500;
  if (flashing) setTimeout(bump, 2600 - (now - G.flash.t));
  const winPct = s.played ? Math.round((s.wins / s.played) * 100) : 0;
  const col = r.done ? (r.won ? C : RED) : C;
  const TILE = 24, GAP = 4;

  const tile = (ch, state, key, extra) => (
    <div key={key} style={{
      width: TILE, height: TILE, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: 700, letterSpacing: 0, textTransform: "uppercase", borderRadius: T.radius ? 3 : 0,
      color: state === undefined ? T.text : state === 0 ? W_RGBA(T.text, 0.55) : `rgb(${T.bg})`,
      background: state === undefined ? W_INSET() : COLS[state],
      border: state === undefined ? `1px solid ${ch ? W_RGBA(C, 0.6) : W_RGBA(C, 0.18)}` : "none",
      boxShadow: state > 0 && T.glow ? `0 0 8px ${W_RGBA(COLS[state], 0.55)}` : "none",
      ...extra,
    }}>{ch}</div>
  );

  const grid = [];
  for (let ri = 0; ri < ROWS; ri++) {
    const done = ri < r.guesses.length, active = ri === r.guesses.length && !r.done;
    const word = done ? r.guesses[ri] : active ? G.cur : "";
    const fresh = done && ri === r.guesses.length - 1 && revealing;
    const cells = [];
    for (let ci = 0; ci < LEN; ci++) {
      const ch = word[ci] || "";
      if (done) {
        const delay = fresh ? ci * FLIP : 0, flipped = !fresh || now - G.revealAt >= delay + FLIP / 2;
        cells.push(tile(ch, flipped ? rowsScored[ri][ci] : undefined, ci, fresh ? { animation: `wdflip ${FLIP * 1.6}ms ease ${delay}ms both` } : {}));
      } else cells.push(tile(ch, undefined, ci, active && ch && ci === G.cur.length - 1 ? { animation: "wdpop 120ms ease" } : {}));
    }
    grid.push(
      <div key={ri} style={{ display: "flex", gap: GAP, animation: active && now - G.shakeAt < 400 ? "wdshake 380ms ease" : "none" }}>{cells}</div>
    );
  }

  const maxD = Math.max(1, ...s.dist);
  const endCard = r.done && !G.hideEnd && !revealing ? (
    <div onClick={() => { G.hideEnd = true; bump(); }} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 5, background: `rgba(${T.bg},0.86)`, textAlign: "center", cursor: "pointer" }}>
      <div style={{ fontSize: 11, letterSpacing: 2, color: r.won ? C : RED, textShadow: T.glow ? `0 0 8px ${r.won ? C : RED}` : "none" }}>
        {r.won ? ["GENIUS", "MAGNIFICENT", "IMPRESSIVE", "SPLENDID", "GREAT", "PHEW"][r.guesses.length - 1] : "OUT OF TRIES"}
      </div>
      <div style={{ fontSize: 9, letterSpacing: 3, color: T.text }}>{r.word.toUpperCase()}</div>
      {!practice && (
        <div style={{ width: 150, marginTop: 4 }}>
          {s.dist.map((n, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2, fontSize: 7 }}>
              <span style={{ width: 6, color: DIM }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ width: `${Math.max(8, (n / maxD) * 100)}%`, background: r.won && i === r.guesses.length - 1 ? C : W_RGBA(DIM, 0.5),
                  color: `rgb(${T.bg})`, textAlign: "right", paddingRight: 2, boxSizing: "border-box", fontSize: 7, lineHeight: "9px" }}>{n}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ fontSize: 7, letterSpacing: 1.2, color: DIM, marginTop: 2 }}>{"⏎ OR NEW ▸ FOR ANOTHER WORD"}</div>
      <div style={{ fontSize: 6.5, letterSpacing: 1, color: DIM, animation: "wdblink 1.4s steps(1) infinite" }}>CLICK TO SEE THE BOARD</div>
    </div>
  ) : null;

  return (
    <div className={"wctl-" + T.name + (T.glow ? "" : " wctl-noglow")} style={{
      width: 230, height: 314, padding: "16px 18px 14px", overflow: "hidden",
      boxSizing: "border-box", display: "flex", flexDirection: "column",
      ...W_PANEL(col),
    }}>
      <style>{CSS()}</style>
      <style>{W_CSS}</style>
      {T.bin && <div style={{ position: "absolute", inset: 0, fontSize: 8, lineHeight: "10px", letterSpacing: 2, color: C, opacity: 0.06, wordBreak: "break-all", pointerEvents: "none" }}>{BIN}{BIN}</div>}
      {T.brackets && ["tl", "tr", "bl", "br"].map((p) => <Bracket key={p} pos={p} color={col} />)}

      {/* header */}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 9, letterSpacing: 2, flexShrink: 0 }}>
        <span style={{ color: C, textShadow: T.glow ? `0 0 6px ${C}` : "none" }}>WORDLE//</span>
        {true ? (
          <span style={{ display: "flex", gap: 4 }}>
            <span className="wd-btn" onClick={cycleLang} title="Language: EN → FR → ES → DE" style={{ cursor: "pointer", userSelect: "none", padding: "1px 4px", fontSize: 7.5, letterSpacing: 1.2, color: AMBER, border: `1px solid ${AMBER}55` }}>{G.lang.toUpperCase()}</span>
            {<span className="wd-btn" onClick={startPractice} style={{ cursor: "pointer", userSelect: "none", padding: "1px 4px", fontSize: 7.5, letterSpacing: 1.2, color: C, border: `1px solid ${C}55` }}>NEW ▸</span>}
            {practice && <span className="wd-btn" onClick={backToDaily} style={{ cursor: "pointer", userSelect: "none", padding: "1px 4px",
              fontSize: 7.5, letterSpacing: 1.2, color: BLUE, border: `1px solid ${BLUE}55` }}>◂ DAILY</span>}
          </span>
        ) : <span style={{ fontSize: 8, letterSpacing: 1.5, color: DIM }}>DAILY</span>}
      </div>
      <div style={{ position: "relative", height: 1, background: `${C}33`, margin: "8px 0 6px", flexShrink: 0 }} />

      {/* stats */}
      <div style={{ position: "relative", display: "flex", flexShrink: 0, marginBottom: 6 }}>
        {stat(practice ? "PRACTICE" : "TODAY", r.done ? (r.won ? `${r.guesses.length}/6` : "X/6") : `${r.guesses.length}/6`, practice ? AMBER : C, "left")}
        {stat("LAST", s.last || "—", null, "center")}
        {stat("STREAK", s.streak, BLUE, "center")}
        {stat("MAX", s.maxStreak, AMBER, "center")}
        {stat("WIN", `${winPct}%`, null, "right")}
      </div>

      {/* board — focusable: keys only arrive while it has focus */}
      <div className="wd-board" tabIndex={0} onKeyDown={onKey} onClick={(e) => e.currentTarget.focus()} style={{
        position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "text", userSelect: "none" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>{grid}</div>

        {/* mini keyboard */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          {LANGS[G.lang].kb.map((row, i) => (
            <div key={i} style={{ display: "flex", gap: 2 }}>
              {i === 2 && <div className="wd-key" onClick={() => press("ENTER")} style={{ width: 24, height: 13, fontSize: 6, display: "flex", alignItems: "center", justifyContent: "center",
                background: W_RGBA(C, 0.18), color: C, cursor: "pointer", borderRadius: T.radius ? 2 : 0 }}>ENTER</div>}
              {row.split("").map((k) => {
                const st = keyState[k.toLowerCase()];
                return (
                  <div key={k} className="wd-key" onClick={() => press(k)} style={{ width: 15, height: 13, fontSize: 7.5, fontWeight: 700, display: "flex", alignItems: "center",
                    justifyContent: "center", cursor: "pointer", borderRadius: T.radius ? 2 : 0,
                    background: st === undefined ? W_RGBA(C, 0.1) : COLS[st], color: st > 0 ? `rgb(${T.bg})` : st === 0 ? W_RGBA(T.text, 0.35) : T.text }}>{k}</div>
                );
              })}
              {i === 2 && <div className="wd-key" onClick={() => press("DEL")} style={{ width: 24, height: 13, fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center",
                background: W_RGBA(C, 0.18), color: C, cursor: "pointer", borderRadius: T.radius ? 2 : 0 }}>⌫</div>}
            </div>
          ))}
        </div>
        {endCard}
      </div>

      <div style={{ position: "relative", marginTop: 4, textAlign: "center", fontSize: 6.5, letterSpacing: 1, color: flashing ? RED : DIM, minHeight: 9,
        textShadow: flashing && T.glow ? `0 0 6px ${RED}88` : "none" }}>
        {flashing ? `✕ ${G.flash.text}` : r.done ? `${s.wins} WON · ${s.played} PLAYED` : "CLICK THE BOARD · TYPE · ⏎"}
      </div>
    </div>
  );
};
