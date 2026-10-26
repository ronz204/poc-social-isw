# Weather Panel — Design

> The left panel's content: current temperature and wind for the visitor's approximate location. Presentation layer of weather-panel.spec.md.

## Scope

Covers what the weather panel shows for each outcome of the weather use case: success, success on the default location, and unavailable.

Non-goals:

- The panel's frame, title and position among the other panels: page-shell.design.md.
- A refresh control, a location input or a forecast; the spec excludes them.
- Colors and theme.

## Layout

Inside the panel's frame, top to bottom:

- **Temperature:** the largest element, in °C.
- **Wind speed:** below it, in km/h, with a "Wind" label.
- **Place name:** shown above the temperature only when the location has one.
- **Default-location note:** a small line at the bottom, shown only for the default location.

## States

- While the weather is available for a resolved location, the panel shows the temperature and the wind speed, plus the place name when there is one.
- While the weather is available for the default location, the panel also shows the note "Showing San José (default location)".
- While the weather is unavailable, the panel shows a friendly message in place of the readings and no note.

There is no loading state: the weather is part of the page response, so the panel arrives already filled or already unavailable. There is no empty state: the use case always returns a reading or `unavailable`.

## Interactions

None. The panel is read-only and refreshes only when the page is loaded again. There are no confirmation steps.

## Consumes

| Source | Used for |
|---|---|
| Weather use case result: reading | Temperature and wind speed |
| Weather use case result: location name | Place name, when present |
| Weather use case result: `isDefault` | The default-location note |
| Weather use case result: `unavailable` | The friendly message |

The panel writes nothing.

## Deferred / Open questions

- Friendly message wording for the unavailable state; a first line is "Weather is not available right now".
- Whether to round the temperature and wind speed, and to how many decimals.
- Icon or text only for the wind and temperature.

## Acceptance criteria

1. Given a public IP the lookup resolves, when the page loads, then the panel shows the temperature in °C and the wind in km/h, and no default-location note. [manual: load the page with a stubbed lookup returning a public location]
2. Given a loopback IP, when the page loads on a local run, then the panel shows the readings for San José and the note "Showing San José (default location)". [manual: open the page on localhost]
3. Given the weather host is unreachable, when the page loads, then the panel shows its friendly message and no readings, and the other panels render normally. [manual: block the weather host and reload]
4. Given a location without a name, when the page loads, then no place line appears. [manual: load the page with a location that has no name]

---

Last updated: 2026-10-26.
