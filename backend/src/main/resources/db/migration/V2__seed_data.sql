-- Seed badge definitions
INSERT INTO badge_definitions (code, name, description, icon_key, color) VALUES
('ONE_ON_ONE_CHAMPION', '1:1 Champion', '100% utilization in the previous month', 'trophy', '#FFD700'),
('STREAK_STAR', 'Streak Star', '2+ consecutive months with >80% utilization', 'star', '#FF6B6B'),
('MOST_IMPROVED', 'Most Improved', 'Highest month-on-month improvement', 'trending-up', '#4ECDC4'),
('HEAVY_LIFTER', 'Heavy Lifter', 'Team size ≥7 with >80% utilization', 'dumbbell', '#95E1D3');

-- Seed default formula configuration
INSERT INTO formula_config (
    version,
    utilization_weight,
    team_size_weight,
    consistency_weight,
    team_size_mapping,
    classification_thresholds,
    consistency_penalty_multiplier,
    active,
    created_by
) VALUES (
    1,
    0.70,
    0.20,
    0.10,
    '{"1-3": 25, "4-6": 50, "7-10": 75, "10+": 100}'::jsonb,
    '{"Gold": {"min": 90, "max": 100}, "Silver": {"min": 60, "max": 89}, "Bronze": {"min": 30, "max": 59}, "Ignition Zone": {"min": 0, "max": 29}}'::jsonb,
    2.0,
    TRUE,
    'system'
);

