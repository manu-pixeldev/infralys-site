FX:

Shimmer CTA (dans le fichier fx-styles.tsx)

Le rythme du shimmer dépend uniquement des classes CSS :

.fx-cta → shimmer normal (CTA principal standard)

.fx-cta-lg → shimmer lent (gros / full-width)

.fx-cta-3x → 3 passages puis stop (ultra luxe)

.fx-cta-luxe → easing encore plus doux (optionnel)

Border scan template-engine
716-729

className={cx(
"reveal",
fx.enabled && fx.softGlow && "fx-softglow",

fx.enabled &&
fx.borderScan && [
"fx-border-scan",
"border", // 🔑 OBLIGATOIRE
theme.isDark
? "border-white/15" // ✅ visible sur charcoal/studio
: "border-black/10", // ✅ discret sur clair
]
)}
