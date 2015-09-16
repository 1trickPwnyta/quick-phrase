function MaxSecondsPerStageMenuItem(menu) {

	/**
	 * Constructor.
	 */
	{
		return new NumericMenuItem(
				menu,
				"menuItemMaximumTime",
				MIN_TIME_STAGE_SECONDS,
				MAX_TIME_STAGE_SECONDS);
	}
	
}
