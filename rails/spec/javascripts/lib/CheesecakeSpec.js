describe("Cheesecake", function() {
	var cheesecake;

	beforeEach(function() {
		loadFixtures('cheesecake.html');

		cheesecake = new socialCheesecake.Cheesecake({
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

		});
	});
	
	it("should have been created", function() {
		expect(typeof cheesecake).not.toBe("undefined");

	});
});
