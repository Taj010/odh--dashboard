# QA Verification Test Cases - RHOAIENG-96598

## General Information

**Status**: In Progress
**Target Release**: TBD (Jira fixVersion unavailable — API token cannot browse project RHOAIENG)
**Epic Assignee**: TBD
**Epic Link**: [RHOAIENG-96598](https://redhat.atlassian.net/browse/RHOAIENG-96598)
**Feature Link**: TBD
**Performed**: Sprint TBD
**Builds used**: TBD

**Data source note**: Jira MCP/REST returned *Issue does not exist or you do not have permission* for all `RHOAIENG-*` keys (`No project could be found with key 'RHOAIENG'`). Child stories and acceptance criteria below were reconstructed from merged/open GitHub PRs and the current `odh-dashboard` UI implementation. Re-verify titles/ACs against Jira once API access is restored.

**Supporting Documentation**:
- Figma: TBD
- Reviewed microcopy (96606): [Google Doc](https://docs.google.com/document/d/10ybrcU5mzXctn1NPnHtOfHvlpOeiWPzn_iOKg-rZsxQ/edit?usp=sharing)
- Upstream/midstream PRs:
  - [PR #9924](https://github.com/opendatahub-io/odh-dashboard/pull/9924) — `runtimeCatalog` feature flag
  - [PR #10007](https://github.com/opendatahub-io/odh-dashboard/pull/10007) — tab + details route (RHOAIENG-96601 / unblocks 96602)
  - [PR #10081](https://github.com/opendatahub-io/odh-dashboard/pull/10081) — landing gallery (RHOAIENG-96601)
  - [PR #10084](https://github.com/opendatahub-io/odh-dashboard/pull/10084) — details page (RHOAIENG-96602)
  - [PR #9995](https://github.com/opendatahub-io/odh-dashboard/pull/9995) — Install wizard foundation (RHOAIENG-96638–96642)
  - [PR #10196](https://github.com/opendatahub-io/odh-dashboard/pull/10196) — Install extension point (RHOAIENG-96604)
  - [PR #10231](https://github.com/opendatahub-io/odh-dashboard/pull/10231) — Integrate Install on details (RHOAIENG-96642, open at generation time)
  - [PR #10233](https://github.com/opendatahub-io/odh-dashboard/pull/10233) — Microcopy + icon (RHOAIENG-96606, open at generation time)

**Preconditions (all TCs unless noted)**:
- Cluster/dashboard build that includes Runtime image library work
- Feature flag `runtimeCatalog` enabled (Dashboard config or `?devFeatureFlags=runtimeCatalog=true`)
- Model Serving / KServe / related areas available as required by `SupportedArea.RUNTIME_CATALOG`
- Admin user for positive admin paths; non-admin project user for RBAC negatives
- Navigation base: **Settings → Model resources and operations → Model deployment settings**
- Library tab path: `/settings/model-resources-operations/model-deployment-settings/serving-runtime-catalog`

---

## 1. Feature flag and tab registration (RHOAIENG-96601 / flag plumbing)

### TC 1.1 - Runtime library tab visible for admin when flag is on

**Steps**:
1. Log in as a product/cluster admin.
2. Enable `runtimeCatalog` (config or `?devFeatureFlags=runtimeCatalog=true`).
3. Open **Model deployment settings**.
4. Inspect the horizontal tabs.

**Expected Result**:
- [ ] A tab named **Runtime image library** (or **Runtime library** if RHOAIENG-96606 is merged) is present
- [ ] Selecting the tab loads `/settings/model-resources-operations/model-deployment-settings/serving-runtime-catalog`
- [ ] Page content area shows `data-testid="runtime-catalog-page"` (or equivalent gallery UI)

### TC 1.2 - Runtime library tab hidden when flag is off

**Steps**:
1. Log in as admin.
2. Ensure `runtimeCatalog` is **disabled** (no override query param).
3. Open **Model deployment settings**.

**Expected Result**:
- [ ] **Runtime image library** / **Runtime library** tab is not shown
- [ ] Direct navigation to `/…/serving-runtime-catalog` does not expose the library UI (404 or empty/gated behavior consistent with other flag-gated settings tabs)

### TC 1.3 - Non-admin cannot access Runtime library tab or details

**Steps**:
1. Log in as a non-admin user (e.g. project edit user).
2. Enable `runtimeCatalog` the same way as TC 1.1.
3. Open **Model deployment settings** (or navigate to the library URL directly).
4. Attempt to open a details URL: `/settings/model-resources-operations/model-deployment-settings/serving-runtime-catalog/<runtimeId>`.

**Expected Result**:
- [ ] Non-admin does not see the Runtime library tab
- [ ] Direct details URL does not show the admin library details content (e.g. page not found / unauthorized pattern used elsewhere for admin settings)
- [ ] No Install action is available to the non-admin user

---

## 2. Runtime image library landing (RHOAIENG-96601)

### TC 2.1 - Landing page loads gallery of runtime cards

**Steps**:
1. As admin with flag on, open the Runtime library tab.
2. Wait for the gallery to finish loading.
3. Inspect cards (name, description, hardware footer, Latest badge where `versionCount > 0`).

**Expected Result**:
- [ ] Page title defaults to **Runtime image library** (or catalog source name when sources are configured)
- [ ] Description appears (fallback: browse/install wording for serving runtimes)
- [ ] One or more runtime cards render with display name and description
- [ ] Cards with versions show a **Latest** label
- [ ] Hardware label/icon appears when accelerators are present on the runtime

### TC 2.2 - Search by name or description

**Steps**:
1. On the landing page, locate the search field (`runtime-catalog-search-input`).
2. Enter a known runtime name fragment (e.g. `vLLM`).
3. Submit/apply search (`runtime-catalog-search-button` if required).
4. Clear search and confirm the full set returns.

**Expected Result**:
- [ ] Gallery filters to matching runtimes
- [ ] Clearing search restores unfiltered results
- [ ] Placeholder text is **Search by name or description**

### TC 2.3 - Hardware filter and reset filters

**Steps**:
1. In the filter sidebar, expand **Hardware**.
2. Select a hardware value (e.g. NVIDIA GPU).
3. Confirm active filter chips appear.
4. Click **Reset filters** (toolbar and/or empty-state action).

**Expected Result**:
- [ ] Gallery updates to hardware-matching runtimes only
- [ ] Active filter chips reflect the selection
- [ ] Reset clears filters and search and restores the broader gallery

### TC 2.4 - Empty search/filter results

**Steps**:
1. Apply a search or filter combination that matches no runtimes.
2. Observe the empty state.
3. Click **Reset filters**.

**Expected Result**:
- [ ] Empty state title **No results found** is shown
- [ ] Description explains no runtime images match filters
- [ ] **Reset filters** returns results (when data exists)

### TC 2.5 - Empty catalog sources

**Steps**:
1. Use an environment/mock where no runtime catalog sources are configured.
2. Open the Runtime library tab.

**Expected Result**:
- [ ] Empty state **No runtime sources configured** is shown
- [ ] Description indicates there are no runtime image sources to display
- [ ] UI does not crash or show a blank broken layout

### TC 2.6 - Load more runtime images

**Steps**:
1. Use a catalog large enough to paginate (page size 10).
2. Scroll/click **Load more runtime images**.
3. If load-more fails (inject error in mock/staging), observe the alert.

**Expected Result**:
- [ ] Additional cards append without losing prior cards
- [ ] Loading more shows an appropriate loading label
- [ ] On failure, inline danger alert **Failed to load more runtime images** appears

### TC 2.7 - Card navigates to details

**Steps**:
1. On a card with a valid runtime id, click the runtime name link (`runtime-catalog-card-detail-link-<key>`).

**Expected Result**:
- [ ] Browser navigates to `/settings/model-resources-operations/model-deployment-settings/serving-runtime-catalog/<runtimeId>`
- [ ] Details page for that runtime opens

---

## 3. Runtime details page (RHOAIENG-96602)

### TC 3.1 - Details happy path: header, description, sidebar

**Steps**:
1. As admin, open a known runtime details page (e.g. vLLM).
2. Inspect breadcrumb, title, Description card, and Details sidebar.

**Expected Result**:
- [ ] Breadcrumb includes **Runtime image library** (or **Runtime library**) linking back to the tab path
- [ ] Final breadcrumb is the runtime display name
- [ ] H1 shows display name (or name/id fallback)
- [ ] Description card shows runtime description or **N/A**
- [ ] Details sidebar lists Version, Hardware, Model formats, Container image, Publish on/Published
- [ ] Missing values show **N/A**

### TC 3.2 - Available configurations tabs and copy

**Steps**:
1. Open a runtime whose selected version includes both `servingRuntimeTemplate` and `llmInferenceServiceConfig`.
2. Open **Serving runtime template** / **Serving runtime** tab.
3. Open **LLM accelerator configuration** / **LLM runtime** tab.
4. Use the copy control on each code block and on the container image field.

**Expected Result**:
- [ ] Configurations section is visible (heading **Available configurations** or **Runtimes** per 96606)
- [ ] Serving runtime YAML/JSON is shown and copy works
- [ ] LLM configuration YAML/JSON is shown and copy works
- [ ] Container image ClipboardCopy copies the image reference
- [ ] Help text under each tab matches shipped microcopy

### TC 3.3 - Details loading, error, and not-found states

**Steps**:
1. Open details while the API is slow (or mock delayed response) and observe loading.
2. Force an API error for the runtime family request.
3. Open an unknown `runtimeId` or mismatched id.

**Expected Result**:
- [ ] Loading shows a spinner with accessible label **Loading runtime image**
- [ ] Error shows danger alert **Unable to load runtime image** with message
- [ ] Not found shows empty state **Runtime image not found** / *The selected runtime image is not available.*

### TC 3.4 - Latest label on details

**Steps**:
1. Open a runtime with `versionCount > 0`.
2. Confirm the **Latest** label near the title.
3. If RHOAIENG-96606 is merged, open the Latest popover via mouse and keyboard.

**Expected Result**:
- [ ] **Latest** label is visible when versions exist
- [ ] After 96606: popover text is *This is the newest version of this runtime image available in the library.* (no heading)
- [ ] Popover is keyboard-accessible

---

## 4. Install action extension point (RHOAIENG-96604)

### TC 4.1 - Empty state: no contributed Install action

**Steps**:
1. Use a build where no `core.action` is registered for group `runtime-catalog.runtime-image/details-action` (pre-96642, or contribution disabled).
2. Open a valid runtime details page as admin.

**Expected Result**:
- [ ] Details header shows title/labels without an Install/Create button
- [ ] Layout has no awkward empty button gap or console errors
- [ ] Disabled **Create** stub is not present

### TC 4.2 - Contributed Install receives expected actionData (integration check)

**Steps**:
1. Use a build where model-serving (or a test extension) registers Install on group `runtime-catalog.runtime-image/details-action`.
2. Open details for a runtime with both template configs.
3. Click **Install**.
4. On the Install wizard/page, confirm breadcrumbs/cancel use library + details routes and deployment resources are available for the selected target.

**Expected Result**:
- [ ] **Install** button is visible in the details header (`data-testid="runtime-image-install"` when using model-serving contribution)
- [ ] Payload conceptually includes: `runtimeImageId`, `runtimeImageName`, `cancelReturnRoute` (details URL), `libraryReturnRoute` (library tab path), and `deploymentResources` strings when present
- [ ] Blank templates are omitted (no empty-string resource forcing a broken target)
- [ ] Cancel returns to the details page route

---

## 5. Install wizard foundation and targets (RHOAIENG-96638 / 96639 / 96640)

### TC 5.1 - Install wizard opens and shows Install target step

**Steps**:
1. As admin with flag on, start Install from the supported entry point (General settings placeholder **or** details page after 96642).
2. Land on the Install wizard.

**Expected Result**:
- [ ] Page title is **Install \<runtime image name\>**
- [ ] Step **Install target** lists available platform targets (e.g. Serving runtime template / LLM accelerator paths when gated on)
- [ ] **Next** stays disabled until a target is selected
- [ ] **Cancel** closes/navigates to `cancelReturnRoute`

### TC 5.2 - Configure step renders selected platform form

**Steps**:
1. Select a Serving runtime install target and click **Next**.
2. Inspect the Configure step (RHOAIENG-96639 form when complete; stub JSON acceptable only on older builds).
3. Repeat for LLM accelerator target when that resource exists and its feature gate is on (RHOAIENG-96640).

**Expected Result**:
- [ ] Step 2 title/label matches the selected target’s configure step label
- [ ] Form/config UI receives the corresponding deployment resource data
- [ ] User can proceed to create/review per platform implementation without UI crash

### TC 5.3 - No install targets / missing router state

**Steps**:
1. Open the Install route directly with no router `actionData` state.
2. Separately open Install with actionData that has no matching install-target resources.

**Expected Result**:
- [ ] Missing data shows unavailable messaging (*installation data is missing…*) and a return control
- [ ] No matching targets shows unavailable messaging (*No runtime image install target extensions are available.* or no-resources message)
- [ ] Return navigates to a safe settings/library route

### TC 5.4 - LLM target hidden when feature gate inactive

**Steps**:
1. Disable the LLM accelerator / vLLM-on-MaaS (or equivalent) gate used by the contribution.
2. Open Install for a runtime that would otherwise support both targets.

**Expected Result**:
- [ ] LLM/accelerator radio or target is not shown
- [ ] Serving runtime target still works when its resource is present

---

## 6. Final Install route under library details (RHOAIENG-96641 / 96642)

### TC 6.1 - Install mounts under details URL (post-integration)

**Steps**:
1. On a build with RHOAIENG-96642 (+ 96641 route work), open runtime details.
2. Click **Install**.
3. Inspect the URL and breadcrumbs.

**Expected Result**:
- [ ] Install route is under the runtime details path (e.g. `…/serving-runtime-catalog/<runtimeId>/install`) rather than the General settings placeholder path
- [ ] Breadcrumb includes Model deployment settings → Runtime library (linked via `libraryReturnRoute`) → runtime name (linked via `cancelReturnRoute`) → **Install**
- [ ] General settings no longer hosts the temporary Install button / placeholder host

### TC 6.2 - End-to-end Install from library card to wizard cancel

**Steps**:
1. Landing → open runtime card → details → **Install**.
2. Select a target, go to Configure, then click **Cancel**.
3. From details, click breadcrumb back to the library.

**Expected Result**:
- [ ] Full navigation path works without 404s
- [ ] Cancel returns to the same runtime details page
- [ ] Library breadcrumb returns to the gallery tab

### TC 6.3 - Non-admin blocked from Install route

**Steps**:
1. As non-admin, paste a known Install URL (placeholder or final details install path).

**Expected Result**:
- [ ] Install UI is not available (page not found / unauthorized)
- [ ] No cluster create actions are exposed

---

## 7. Reviewed microcopy and icon (RHOAIENG-96606)

> Verify after [PR #10233](https://github.com/opendatahub-io/odh-dashboard/pull/10233) merges. Until then, expect pre-review strings listed in the PR description.

### TC 7.1 - Landing microcopy and card icon

**Steps**:
1. Open the Runtime library landing tab.
2. Check tab name, description, and card icon.

**Expected Result**:
- [ ] Tab name is **Runtime library**
- [ ] Fallback description: *Browse runtimes you can add to this cluster for model serving or LLM inference.*
- [ ] Cards use the Red Hat Container image icon (not the old placeholder server icon)

### TC 7.2 - Details microcopy

**Steps**:
1. Open a details page with both configuration tabs.
2. Compare section/tab labels and helper text to the reviewed doc.

**Expected Result**:
- [ ] Section heading **Runtimes**
- [ ] Tabs **Serving runtime** and **LLM runtime** with the short reviewed descriptions
- [ ] Detail label **Published** (not **Publish on**)
- [ ] Latest popover copy matches TC 3.4

---

## 8. Cross-component / regression checks

### TC 8.1 - Model deployment settings other tabs still work

**Steps**:
1. As admin, visit General settings and other Model deployment settings tabs with `runtimeCatalog` on and off.

**Expected Result**:
- [ ] Existing tabs still load
- [ ] Enabling Runtime library does not break unrelated settings content

### TC 8.2 - Flag off removes Install contribution surface

**Steps**:
1. With Install integrated on details, disable `runtimeCatalog`.
2. Confirm library/details/install routes are gated.
3. Confirm temporary General settings Install (if still present on older builds) is also gated off.

**Expected Result**:
- [ ] No Runtime library / Install UI remains reachable for users
- [ ] No leftover Install button on General settings when 96642 cleanup is present

---

## Bugs

1. TBD
