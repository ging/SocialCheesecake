describe("Sector", function() {
	var cheesecake;
	var cheesecakeDefaults = {
		container: {
			id: "container",
			width: 440,
			height: 440
		},
		grid: {
			id: "grid"
		},
		center: { x: 220, y: 220 },
		rMax: 200,
		sectors: [{
			label: "S1",
			subsectors: [{
				label: "SS1",
				actors: [ "11", "12" ]
			},
			{
				label: "S-2",
				actors: [ "21", "22" ]
			
			}]
		}]
	};

	beforeEach(function() {
		loadFixtures('cheesecake.html');
		cheesecake = new socialCheesecake.Cheesecake(cheesecakeDefaults);

	});

	describe("changes in subsector", function() {
		var sector, subsector, changes;

		beforeEach(function() {
			sector = cheesecake.sectors[0];
			subsector = sector.subsectors[0];
		});

		describe("adding an Actor", function() {
			beforeEach(function() {
				subsector.addActor("1");
				changes = [["1"], []];
			});

			it("should include it", function() {
				expect(subsector.actorChanges).toEqual(changes);
				expect(sector.actorChanges).toEqual(changes);
			});

			describe("removing it", function() {
				beforeEach(function() {
					subsector.removeActor("1");
					changes = [[], []];
				});

				it("should not include it", function() {
					expect(subsector.actorChanges).toEqual(changes);
					expect(sector.actorChanges).toEqual(changes);
				});

				describe("and adding it again", function() {
					beforeEach(function() {
						subsector.addActor("1");
						changes = [["1"], []];
					});

					it("should include it", function() {
						expect(subsector.actorChanges).toEqual(changes);
						expect(sector.actorChanges).toEqual(changes);
					});

				});

			});
		});

		describe("adding an Actor from other subsector", function() {
			var sChanges, ssChanges;
			
			beforeEach(function() {
				subsector.addActor("22");
				sChanges = [[], []];
				ssChanges = [["22"], []];
			});

			it("should include it", function() {
				expect(subsector.actorChanges).toEqual(ssChanges);
				expect(sector.actorChanges).toEqual(sChanges);
			});


			describe("removing it", function() {
				beforeEach(function() {
					subsector.removeActor("22");
					ssChanges = [[], []];
				});

				it("should include not it", function() {
					expect(subsector.actorChanges).toEqual(ssChanges);
					expect(sector.actorChanges).toEqual(sChanges);
				});


			});

		});

		describe("removing an Actor", function() {
			beforeEach(function() {
				subsector.removeActor("12");
				changes = [[], ["12"]];
			});

			it("should include it", function() {
				expect(subsector.actorChanges).toEqual(changes);
				expect(sector.actorChanges).toEqual(changes);
			});

			describe("adding it", function() {
				beforeEach(function() {
					subsector.addActor("12");
					changes = [[], []];
				});

				it("should not include it", function() {
					expect(subsector.actorChanges).toEqual(changes);
					expect(sector.actorChanges).toEqual(changes);
				});

				describe("and removing it again", function() {
					beforeEach(function() {
						subsector.removeActor("12");
						changes = [[], ["12"]];
					});

					it("should include it", function() {
						expect(subsector.actorChanges).toEqual(changes);
						expect(sector.actorChanges).toEqual(changes);
					});

				});

			});

		});
	});
});
