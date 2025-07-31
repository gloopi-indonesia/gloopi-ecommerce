
# Quick Fix Guide for Common ESLint Warnings

## Unused Variables (@typescript-eslint/no-unused-vars)

### For intentionally unused variables:
```typescript
// Before
const { data, error } = useQuery();

// After (if error is intentionally unused)
const { data, _error } = useQuery();
```

### For function parameters:
```typescript
// Before
function handler(req, res) {
  // only using res
}

// After
function handler(_req, res) {
  // only using res
}
```

### For catch blocks:
```typescript
// Before
try {
  // code
} catch (error) {
  // not using error
}

// After
try {
  // code
} catch (_error) {
  // or just catch (_)
}
```

## Empty Object Types (@typescript-eslint/no-empty-object-type)

```typescript
// Before
interface Props extends React.ComponentProps<'div'> {}

// After
type Props = React.ComponentProps<'div'>
```

## Prefer Const (prefer-const)

```typescript
// Before
let value = 'hello';

// After
const value = 'hello';
```

## Next.js Image Optimization (@next/next/no-img-element)

```typescript
// Before
<img src="/image.jpg" alt="Description" />

// After
import Image from 'next/image'
<Image src="/image.jpg" alt="Description" width={500} height={300} />
```
