describe("Cheesecake", function() {
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
		sectors: []


	};

	beforeEach(function() {
		loadFixtures('cheesecake.html');
	});

	describe("empty", function() {
		beforeEach(function() {
			cheesecake = new socialCheesecake.Cheesecake(cheesecakeDefaults);
		});
		
		it("should have been created", function() {
			expect(typeof cheesecake).not.toBe("undefined");

		});

		describe("adding a sector", function() {
			beforeEach(function() {
				cheesecake.addNewSector({
					id: 10,
					label: "dynamic sector",
					subsectors: [{
						id: 11,
						name: "dynamic subsector"
					}]
				});
			});

			it("should include it", function() {
				expect(cheesecake.sectors.length).toBe(2);
				expect(cheesecake.sectors[0].label).toBe("dynamic sector");
				expect(cheesecake.sectors[0].subsectors.length).toBe(1);
				expect(cheesecake.sectors[0].subsectors[0].label).toBe("dynamic subsector");
			});
		});
	});

	describe("with sectors", function() {
		beforeEach(function() {
			opts = $.extend(cheesecakeDefaults, {
				sectors: [
					{ id: 1, name: "test" },
					{ id: 2, name: "spec" }
				]
			});
			cheesecake = new socialCheesecake.Cheesecake(opts);
		});

		it("should have been created", function() {
			expect(typeof cheesecake).not.toBe("undefined");
			expect(cheesecake.sectors.length).toBe(3);
			expect(cheesecake.sectors[0].label).toBe("test");

		});

		describe("when clicking on extraSector", function() {
			var sectorsLength;

			beforeEach(function() {
				var extraSector = cheesecake.sectors[cheesecake.sectors.length - 1];
				sectorsLength = cheesecake.sectors.length;
				spyOn(cheesecake, 'addNewSector').andCallThrough();

				extraSector._region._handleEvents('onclick');
			});

			it("should call cheesecake.addNewSector", function() {
				expect(cheesecake.addNewSector).toHaveBeenCalled();
			});

			it("should create new sector", function() {
				expect(cheesecake.sectors.length).toBe(sectorsLength + 1);
			});

		});

		describe("and subsectors", function() {
			beforeEach(function() {
				opts = $.extend(cheesecakeDefaults, {
					sectors: [{
						id: 1,
						name: "test",
						subsectors: [{
							id: 2,
							name: "subtest"
						},
						{
							id: 3,
							name: "subspec"
						}]
					}]
				});
				cheesecake = new socialCheesecake.Cheesecake(opts);
			});

			it("should have been created", function() {
				expect(typeof cheesecake).not.toBe("undefined");
				expect(cheesecake.sectors.length).toBe(2);
				expect(cheesecake.sectors[0].label).toBe("test");
				expect(cheesecake.sectors[0].subsectors.length).toBe(2);
				expect(cheesecake.sectors[0].subsectors[0].label).toBe("subtest");


			});
		});
	});

});
