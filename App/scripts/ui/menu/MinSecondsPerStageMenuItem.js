function MinSecondsPerStageMenuItem(menu) {

	/**
	 * Constructor.
	 */
	{
		return new NumericMenuItem(
				menu,
				"menuItemMinimumTime",
				MIN_TIME_STAGE_SECONDS,
				MAX_TIME_STAGE_SECONDS);
	}
	
}
