# ODH Dashboard Learning Resources

## Knowledge

- [CONTRIBUTING.md — Running locally](CONTRIBUTING.md)
  How to start frontend-only vs frontend+backend, `oc login`, ports, port-forward. Primary source for Lesson 4.
- [Dev setup](docs/dev-setup.md)
  Node/npm/`oc` requirements, `npm install`, `?devFeatureFlags`. Use for: first-time machine setup.
- [Extensibility](docs/extensibility.md)
  How `app.route`, navigation extensions, and code references work. Use for: finding pages, understanding plugin registration (Lesson 5).
- [ODH Dashboard README](README.md)
  Project overview, setup instructions, and development commands. Start here.
- [Architecture Doc](docs/architecture.md)
  How the frontend, backend, and Kubernetes API server connect. Use for: understanding the overall system.
- [BOOKMARKS.md](BOOKMARKS.md)
  Index of all key documentation in the repo. Use for: finding the right doc for any area.
- [CONTRIBUTING.md](CONTRIBUTING.md)
  How to run locally, write tests, submit PRs. Use for: day-to-day development workflow.
- [TypeScript for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
  Best starting point for someone who knows JS. Covers types, interfaces, unions, generics in one short page.
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
  Full official TS docs. Use for: deeper reference when you encounter advanced syntax in the codebase.
- [PatternFly v6 Documentation](https://www.patternfly.org/)
  The UI component library used by this project. Use for: understanding available components and design patterns.
- [Kubernetes Basics — official tutorial](https://kubernetes.io/docs/tutorials/kubernetes-basics/)
  Gentle intro to Kubernetes concepts. Use for: understanding what the dashboard is managing under the hood.
- [Webpack Module Federation docs](https://webpack.js.org/concepts/module-federation/)
  How runtime code sharing works. Use for: understanding how packages load into the main dashboard.

## Wisdom (Communities)

- [ODH Dashboard GitHub Issues](https://github.com/opendatahub-io/odh-dashboard/issues)
  The issue tracker. Good first issues are tagged. Use for: finding work to contribute.
- [Open Data Hub Community](https://opendatahub.io/community/)
  Community meetings and communication channels. Use for: asking questions, getting context on decisions.

## Gaps

- No beginner-friendly "how this codebase works" walkthrough exists in the repo docs (this teaching workspace fills that gap)
