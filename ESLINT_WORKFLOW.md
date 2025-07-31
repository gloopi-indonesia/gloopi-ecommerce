# ESLint Workflow Guide

## Current Setup ✅

You now have a **non-blocking ESLint workflow** that allows confident development while gradually improving code quality.

### What's Working
- **ESLint 9.12.0** with **Next.js 14.2.15** - fully functional
- **133 total warnings** (no errors) - builds won't fail
- **87.2% are unused variables** - safe to address gradually
- **Enhanced configuration** for better developer experience

## Quick Commands

```bash
# Run linting (as usual)
bun run lint

# Analyze warnings with detailed breakdown
bun run lint:analyze

# Get suggestions for fixing unused variables
bun run lint:fix-unused

# Type checking (remember to run after changes)
bun run type-check
```

## Warning Breakdown

| Category | Count | Priority | Description |
|----------|-------|----------|-------------|
| Unused Variables | 116 (87.2%) | Low | Variables, imports, parameters |
| Empty Interfaces | 7 (5.3%) | Low | Can be simplified to types |
| Code Quality | 3 (2.3%) | Medium | `prefer-const`, unsafe chaining |
| TypeScript Issues | 5 (3.8%) | Medium | Expressions, comments |
| Next.js Optimization | 2 (1.5%) | **High** | Image optimization |

## Development Workflow

### 1. Continue Development with Confidence
- ✅ All warnings are **non-blocking**
- ✅ Builds and deployments work normally
- ✅ Focus on features, not linting noise

### 2. Gradual Improvement Strategy

#### High Priority (Fix First)
- **Next.js optimizations** (2 warnings)
  - Replace `<img>` with `<Image>` from `next/image`
  - Files: `CompareImage.tsx`

#### Medium Priority (Fix When Touching Files)
- **Code quality issues** (8 warnings)
  - Fix unsafe optional chaining
  - Change `let` to `const` where appropriate

#### Low Priority (Fix During Cleanup)
- **Unused variables** (116 warnings)
  - Add `_` prefix for intentionally unused vars
  - Remove truly unnecessary imports/variables

### 3. File-by-File Approach

**Top files to focus on:**
1. `cart/components/item.tsx` (8 warnings)
2. `CompareImage.tsx` (7 warnings) 
3. `emails/verify.tsx` (6 warnings each app)
4. `blog/[slug]/page.tsx` (5 warnings)

## Quick Fixes

### Unused Variables
```typescript
// Before
const { data, error } = useQuery();
const [open, setOpen] = useState(false);

// After (if intentionally unused)
const { data, _error } = useQuery();
const [_open, _setOpen] = useState(false);
```

### Empty Interfaces
```typescript
// Before
interface Props extends ComponentProps<'div'> {}

// After
type Props = ComponentProps<'div'>
```

### Next.js Images
```typescript
// Before
<img src="/image.jpg" alt="Description" />

// After
import Image from 'next/image'
<Image src="/image.jpg" alt="Description" width={500} height={300} />
```

## Tracking Progress

### Weekly Review
```bash
# Run analysis to see progress
bun run lint:analyze

# Check the generated report
cat lint-report.json
```

### Before Commits
```bash
# Quick check for new issues
bun run lint
bun run type-check
```

## Next.js 15 Upgrade Path

When ready to upgrade for full ESLint 9 compatibility:

1. **Check compatibility**: Next.js 15 has better ESLint 9 support
2. **Update dependencies**: `next@15`, `eslint-config-next@15`
3. **Test thoroughly**: Ensure no breaking changes
4. **Gradual rollout**: Test in development first

## Configuration Files

- `apps/admin/.eslintrc` - Admin app ESLint config
- `apps/storefront/.eslintrc` - Storefront app ESLint config
- `scripts/lint-analysis.js` - Warning analysis tool
- `scripts/fix-unused-vars.js` - Unused variable helper
- `LINT_FIXES.md` - Quick reference guide

## Tips for Success

1. **Don't fix everything at once** - gradual improvement is sustainable
2. **Focus on files you're already editing** - natural cleanup opportunities
3. **Use underscore prefix liberally** - for intentionally unused variables
4. **Prioritize performance warnings** - Next.js optimizations matter most
5. **Run analysis weekly** - track progress and celebrate improvements

---

**Remember**: The goal is confident development, not perfect linting. Fix warnings when convenient, not when they block you! 🚀
