# User mixed three “BFF” questions after reading the spike notes

The user already had the OpenShell Migration Strategies summary (embedding, Chi, go.mod pin, Gage / Derek / Dan) plus https://github.com/d0w/openshell-bff-examples, and a meeting takeaway that “two BFFs could complicate structure.” That is prior knowledge, not a blank slate.

What was not yet separate: (1) two backends — CR vs gateway, locked; (2) two processes — :8843 vs :8943, current plan, merge still possible; (3) code reuse — import/decorate vs fork. Mixing those three is why “one or two BFFs” felt unanswerable. Future sessions should use those labels, not a single 1-vs-2 flag.

**Implications:** Next teaching can go deeper on Chi vs httprouter or on 89723 proxy wiring. Do not re-explain Sandbox CR vs gateway from scratch. Do not treat process-merge as decided.
