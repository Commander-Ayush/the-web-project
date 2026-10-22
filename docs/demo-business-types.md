# Recipe: add multiple business types to the demo platform

Status: future implementation guide only. The multi-business implementation was rolled back at your request. The app currently uses one client CSV and the security website.

## 1. What exists today

Java source root: `src/main/java/com/thewebproject/app/thwebproject/`.

| File | Current responsibility |
| --- | --- |
| `src/main/resources/clients.csv` | Security clients: `id,businessName,tagline,phone,email,address` |
| `service/ClientDirectoryService.java` | Reads the CSV at startup and stores clients in `Map<Integer, Client>` |
| `controller/DemoController.java` | Renders `demosite` for `/demo-security-site/{id}`; serves admin aliases |
| `controller/DemoBookingApiController.java` | Services, booking submissions, public reviews and review submissions |
| `controller/DemoAdminApiController.java` | Booking management, review moderation, catalog and dashboard |
| `entity/DemoBooking.java`, `entity/DemoReview.java` | Persist records using `clientId` |
| `repositories/DemoBookingRepository.java`, `repositories/DemoReviewRepository.java` | Read and mutate records by client ID |
| `src/main/resources/templates/demosite.html` | Security website; exposes `window.CLIENT_DATA` |
| `src/main/resources/static/demoapi.js` | Builds `/api/demo/${CLIENT_ID}` |
| `src/main/resources/static/admin-panel/js/admin-api.js` | Gets client ID from URL; builds API URLs and admin links |
| `src/main/resources/static/admin-panel/js/admin-ui.js` | Admin interactions and redirect back to the website |

The generic `/demo-security-site` uses placeholder client `0`. The APIs currently allow `0` as the default demo client.

## 2. Target behavior

Use **business type + client ID** as the client identity:

```text
/demo/security/623451       -> security CSV -> security website
/demo/restaurants/1         -> restaurant CSV -> restaurant website
/demo/restaurants/admin/1   -> restaurant client's admin
```

Different CSVs can reuse the same numeric ID. Security client `1` and restaurant client `1` must have independent bookings and reviews.

Keep old `/demo-security-site/...` and `/api/demo/{clientId}/...` URLs as security aliases so existing links continue working.

Restaurants are an example; replace this type with whichever business category you actually need.

## 3. Register CSVs and templates

Create `src/main/resources/demo-businesses.properties`:

```properties
security=clients.csv,demosite
restaurants=clients/restaurants.csv,restaurant-site
```

Keep the existing security CSV in place. Add `src/main/resources/clients/restaurants.csv`:

```csv
id,businessName,tagline,phone,email,address
1,The Garden Table,Seasonal food and a warm welcome,555-0101,hello@example.com,"123 Garden Street"
```

The names after the commas are Thymeleaf template names, without `.html`. Add `src/main/resources/templates/restaurant-site.html` and its CSS/JS assets.

Use an explicit registry. Do not derive arbitrary resource or template paths directly from incoming URL values.

## 4. Refactor ClientDirectoryService

Replace the single map with:

```java
Map<String, Map<Integer, Client>> directories;
```

At startup:

1. Load the business registry.
2. Validate business slugs, for example `[a-z][a-z0-9-]*`.
3. Validate that each CSV and template exists.
4. Parse each CSV into that type's map, keeping UTF-8 and quoted-field support.
5. Reject duplicate/nonpositive IDs and malformed rows with a useful error identifying the CSV.

Expose these operations:

```java
Optional<Client> findById(String businessType, int id);
String template(String businessType);
String requireClient(String businessType, int id);
```

`requireClient` should resolve a missing business type to `security` for legacy APIs and return the resolved type. Unknown types and missing clients should produce HTTP 404. Reserve placeholder ID `0` for security only.

Keep `findById(int id)` as a security wrapper while legacy page handlers use it.

The existing `Client` fields can serve basic contact details across business types. Business-specific data, such as a menu or opening hours, requires additional fields or separate models and storage.

## 5. Add page routes in DemoController

Add:

```text
GET /demo/{businessType}/{id}
GET /demo/{businessType}/admin/{id}
GET /demo/{businessType}/admin/{id}/dashboard.html
GET /demo/{businessType}/admin/{id}/services
```

For the public website, validate the type/client, put `client` and `businessType` into the model, and return the registered template. Only security ID `0` should fall back to the existing default client.

For admin pages, validate the type/client before forwarding to the existing dashboard or services HTML. Preserve all existing security routes.

## 6. Scope the public and admin APIs

Support both class-level mappings in `DemoBookingApiController`:

```java
@RequestMapping({"/api/demo/{clientId}", "/api/demo/{businessType}/{clientId}"})
```

And in `DemoAdminApiController`:

```java
@RequestMapping({"/api/demo/{clientId}/admin", "/api/demo/{businessType}/{clientId}/admin"})
```

Accept an optional business type in each handler:

```java
@PathVariable(required = false) String businessType
```

Resolve and validate it before every read or write, including admin mutations and locked catalog operations. Set the resolved type on every new booking and review.

Public endpoint suffixes remain:

| Method | Suffix | Purpose |
| --- | --- | --- |
| GET | `/services` | The selected business type's catalog |
| POST | `/bookings` | Submit a service/table request |
| GET | `/reviews` | Approved reviews for this client only |
| POST | `/reviews` | Submit a review for moderation |

Admin suffixes remain:

| Method | Suffix |
| --- | --- |
| GET | `/dashboard/summary` |
| GET | `/bookings` |
| POST | `/bookings/{id}/complete` |
| POST | `/bookings/{id}/reopen` |
| DELETE | `/bookings/{id}` |
| GET | `/reviews` |
| POST | `/reviews/{id}/approve` |
| DELETE | `/reviews/{id}` |
| GET / POST | `/services` |
| PUT / DELETE | `/services/{id}` |

## 7. Separate persisted data

Add `businessType` to both `DemoBooking` and `DemoReview`. New entities default to `security`, and every API submission explicitly sets the resolved type.

Migrate existing rows to `security` before allowing reused client IDs:

```sql
ALTER TABLE demo_bookings
  ADD COLUMN business_type varchar(255) NOT NULL DEFAULT 'security';
ALTER TABLE demo_reviews
  ADD COLUMN business_type varchar(255) NOT NULL DEFAULT 'security';
CREATE INDEX idx_demo_booking_business_client
  ON demo_bookings (business_type, client_id);
CREATE INDEX idx_demo_review_business_client
  ON demo_reviews (business_type, client_id);
```

Choose one schema migration mechanism. The project currently uses Hibernate `ddl-auto=update`; if using that mechanism, configure the column's database default and verify its generated migration. Do not also run duplicate `ADD COLUMN` statements. For controlled deployments, use a versioned database migration instead. Verify both the development H2 and production PostgreSQL behavior.

Change repository methods to include the business type:

```java
List<DemoBooking> findByBusinessTypeAndClientIdOrderBySubmittedAtDesc(
    String businessType, Integer clientId);
Optional<DemoBooking> findByIdAndBusinessTypeAndClientId(
    Long id, String businessType, Integer clientId);
```

Apply the equivalent methods to reviews, including:

```java
List<DemoReview> findByBusinessTypeAndClientIdAndApprovedTrueOrderBySubmittedAtDesc(
    String businessType, Integer clientId);
```

Update every controller call. Filtering only list pages is insufficient: approval, deletion, completion, reopening and summary calculations must also use the business type.

## 8. Make browser requests and navigation type-aware

Each website template should expose its identity before loading `demoapi.js`:

```html
<script th:inline="javascript">
  window.DEMO_BUSINESS_TYPE = /*[[${businessType ?: 'security'}]]*/ "security";
  window.CLIENT_DATA = { id: /*[[${client.id}]]*/ 0 };
</script>
```

Preserve other `CLIENT_DATA` fields used by the security page. Render client content with Thymeleaf escaping (`th:text`), and render fetched reviews using DOM `textContent`.

In `demoapi.js`, build:

```javascript
const API_BASE = `/api/demo/${encodeURIComponent(window.DEMO_BUSINESS_TYPE || 'security')}/${CLIENT_ID}`;
```

In `admin-api.js`:

1. Parse `/demo/{businessType}/admin/{clientId}`.
2. Continue parsing `/demo-security-site/admin/{clientId}` as security.
3. Preserve any existing query-string fallback for direct admin pages; include `businessType` if using that fallback.
4. Build API URLs with type and ID.
5. Rewrite dashboard/services links with type and ID.

In `admin-ui.js`, redirect logout/back-to-site actions to `/demo/{businessType}/{clientId}`. Update admin title/branding and business-specific labels where needed.

## 9. Provide business-specific features

Replace the single security catalog assumption with a catalog selected by business type. A small initial implementation can use `servicesFor(businessType)`; larger catalogs should move into a dedicated configuration/service.

Keep the existing security services. For restaurants, start with a `Table reservation` offering. Resolve submitted service IDs against the current type's catalog rather than the security catalog.

A restaurant form can use the shared booking payload with preferred date and party size/time in notes. Explain that it submits a request requiring confirmation. This does not implement table availability, menu management, payments, or automatic reservations; add separate models/endpoints if those become requirements.

The current admin estimates revenue using security service prices. Do not apply those prices to other types. Until there is a suitable revenue model, show zero/unavailable or hide those widgets for other types.

Business-type filtering is data separation, not authentication. Existing demo admin routes are unauthenticated; add authorization before using them as private production admin panels.

## 10. Verify before rollout

Use an isolated in-memory test database rather than the local `data/` database.

- Render both business templates and check client branding.
- Confirm old security public/admin/API routes still work.
- Reuse one client ID in two types and confirm separate bookings and reviews.
- Attempt cross-type approval, deletion, completion and reopening; expect 404 and no changes.
- Check that public reviews include only approved records for the selected type/client.
- Verify unknown types, unknown clients and non-security placeholder ID `0` return 404.
- Verify existing database rows acquire `security` during migration.
- Check admin navigation and back-to-site links retain type and ID.
- Confirm type-specific catalogs and dashboard calculations.
- Run Java compilation, integration tests and JavaScript syntax checks.
- Inspect each template on desktop and mobile, submit its forms, and check admin results.

Back up the database before rollout, migrate it, deploy/restart, then smoke-test old and new links. CSVs are loaded at startup, so roster/configuration changes require a restart or rebuild/redeploy for packaged resources.

## 11. Adding the next category after this refactor

For example, to add salons:

1. Create `clients/salons.csv`.
2. Create `templates/salon-site.html` and its assets.
3. Register `salons=clients/salons.csv,salon-site`.
4. Add salon offerings and any genuinely different business logic.
5. Rebuild/restart and visit `/demo/salons/{id}`.

The shared routing and directory code should then remain unchanged for additional categories that fit the existing models.
