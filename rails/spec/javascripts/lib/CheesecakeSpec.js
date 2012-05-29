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
				console.dir(cheesecake);
				expect(typeof cheesecake).not.toBe("undefined");
				expect(cheesecake.sectors.length).toBe(2);
				expect(cheesecake.sectors[0].label).toBe("test");
				expect(cheesecake.sectors[0].subsectors.length).toBe(2);
				expect(cheesecake.sectors[0].subsectors[0].label).toBe("subtest");


			});
		});
	});

});
