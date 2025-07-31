# Gradual Warning Resolution Plan

## Phase 1: High-Impact, Low-Effort (Week 1-2)

### Priority 1: Next.js Performance Optimizations (2 warnings)
**Impact**: High - affects performance and SEO
**Effort**: Medium

**Files to fix:**
- `apps/storefront/src/components/native/CompareImage.tsx` (lines 410, 418)

**Action:**
```typescript
// Replace these img tags with Next.js Image component
import Image from 'next/image'

// Before:
<img src={rightImage} alt={rightImageAlt} />

// After:
<Image 
  src={rightImage} 
  alt={rightImageAlt}
  width={500} // Add appropriate dimensions
  height={300}
  priority={true} // If above the fold
/>
```

### Priority 2: Code Quality Issues (3 warnings)
**Impact**: Medium - prevents bugs
**Effort**: Low

**Quick fixes:**
1. `apps/storefront/src/lib/omit.ts` (line 5): Change `let key` to `const key`
2. Fix unsafe optional chaining in cart components

## Phase 2: Cleanup During Development (Ongoing)

### Strategy: Fix-as-You-Go
When editing any file, spend 2-3 minutes cleaning up warnings in that file.

**Common patterns to fix:**

#### Unused Imports/Components
```typescript
// Before
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

// After (remove unused)
import { Card } from '@/components/ui/card'
```

#### Unused Variables with Underscore
```typescript
// Before
const { data, error } = useQuery()

// After (if error is intentionally unused)
const { data, _error } = useQuery()
```

#### Empty Interfaces
```typescript
// Before
interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

// After
type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>
```

## Phase 3: Systematic Cleanup (Month 2-3)

### Week-by-Week File Targets

**Week 1: Cart Components (High Usage)**
- `cart/components/item.tsx` (8 warnings)
- `cart/components/grid.tsx` (3 warnings)
- `cart/components/receipt.tsx` (3 warnings)

**Week 2: Email Templates (Low Risk)**
- `emails/verify.tsx` (6 warnings each app)
- `emails/order_notification_owner.tsx` (2 warnings each app)

**Week 3: Profile Components**
- `profile/components/switcher.tsx` (4 warnings)
- `profile/edit/components/user-form.tsx` (2 warnings)

**Week 4: API Routes**
- `api/products/route.ts` (3 warnings admin)
- `api/subscription/*/route.ts` (4 warnings storefront)

## Automation Helpers

### Daily Development
```bash
# Before starting work
bun run lint:analyze

# When editing a file, check its warnings
bun run lint:fix-unused | grep "filename"
```

### Weekly Progress Check
```bash
# Run full analysis
bun run lint:analyze

# Compare with previous week's numbers
# Goal: Reduce total warnings by 10-15 per week
```

### Monthly Review
1. Run `bun run lint:analyze`
2. Update this plan based on progress
3. Celebrate improvements! 🎉

## Success Metrics

### Short-term (1 month)
- ✅ Zero high-priority warnings (Next.js optimizations)
- ✅ Reduce total warnings by 30-40 (to ~95)
- ✅ All team members comfortable with workflow

### Medium-term (3 months)
- ✅ Reduce total warnings by 60-70 (to ~65)
- ✅ No warnings in newly created files
- ✅ Established "fix-as-you-go" culture

### Long-term (6 months)
- ✅ Under 30 total warnings
- ✅ Consider upgrading to Next.js 15
- ✅ Implement stricter rules for new code

## Team Guidelines

### For New Code
1. **Zero tolerance for new warnings** in new files
2. **Use underscore prefix** for intentionally unused variables
3. **Prefer types over empty interfaces**
4. **Use Next.js Image component** for all images

### For Existing Code
1. **Fix warnings when editing** existing files
2. **Don't create separate "linting PRs"** - integrate with feature work
3. **Focus on high-impact warnings first**
4. **Ask for help** if unsure about a warning

### Code Review Checklist
- [ ] No new ESLint warnings introduced
- [ ] Existing warnings in modified files addressed (when reasonable)
- [ ] Used appropriate patterns from quick fix guide

## Emergency Procedures

### If Linting Blocks Development
1. **Check if it's an error vs warning** - warnings shouldn't block
2. **Temporarily disable specific rule** if absolutely necessary:
   ```typescript
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const unusedVar = something;
   ```
3. **Create issue** to address properly later
4. **Never disable entire ESLint** - warnings are valuable

### If Analysis Scripts Break
1. **Use basic `bun run lint`** - core functionality always works
2. **Check script syntax** - they're just Node.js scripts
3. **Regenerate scripts** if needed - they're not critical for development

---

**Remember**: This is a marathon, not a sprint. Consistent small improvements beat sporadic large cleanup efforts! 🏃‍♂️
