import { Body, Bodies, Constraint, Composite, Common } from 'matter-js';

export class RagdollFactory {
    static makeRagdoll(
        x: number,
        y: number,
        scale: number = 1,
        options = null,
    ) {
        const headOptions = Common.extend(
            {
                label: 'head',
                collisionFilter: {
                    group: Body.nextGroup(true),
                },
                chamfer: {
                    radius: [70 * scale, 70 * scale, 70 * scale, 70 * scale],
                },
                render: {
                    fillStyle: '#FFBC42',
                },
            },
            options,
        );

        const chestOptions = Common.extend(
            {
                label: 'chest',
                collisionFilter: {
                    group: Body.nextGroup(true),
                },
                chamfer: {
                    radius: [20 * scale, 20 * scale, 26 * scale, 26 * scale],
                },
                render: {
                    fillStyle: '#E0A423',
                },
            },
            options,
        );

        const leftArmOptions = Common.extend(
            {
                label: 'left-arm',
                collisionFilter: {
                    group: Body.nextGroup(true),
                },
                chamfer: {
                    radius: 10 * scale,
                },
                render: {
                    fillStyle: '#FFBC42',
                },
            },
            options,
        );

        const leftLowerArmOptions = Common.extend({}, leftArmOptions, {
            label: 'left-arm-lower',
            render: {
                fillStyle: '#E59B12',
            },
        });

        const rightArmOptions = Common.extend(
            {
                label: 'right-arm',
                collisionFilter: {
                    group: Body.nextGroup(true),
                },
                chamfer: {
                    radius: 10 * scale,
                },
                render: {
                    fillStyle: '#FFBC42',
                },
            },
            options,
        );

        const rightLowerArmOptions = Common.extend({}, rightArmOptions, {
            label: 'right-arm-lower',
            render: {
                fillStyle: '#E59B12',
            },
        });

        const leftLegOptions = Common.extend(
            {
                label: 'left-leg',
                collisionFilter: {
                    group: Body.nextGroup(true),
                },
                chamfer: {
                    radius: 10 * scale,
                },
                render: {
                    fillStyle: '#FFBC42',
                },
            },
            options,
        );

        const leftLowerLegOptions = Common.extend({}, leftLegOptions, {
            label: 'left-leg-lower',
            render: {
                fillStyle: '#E59B12',
            },
        });

        const rightLegOptions = Common.extend(
            {
                label: 'right-leg',
                collisionFilter: {
                    group: Body.nextGroup(true),
                },
                chamfer: {
                    radius: 10 * scale,
                },
                render: {
                    fillStyle: '#FFBC42',
                },
            },
            options,
        );

        const rightLowerLegOptions = Common.extend({}, rightLegOptions, {
            label: 'right-leg-lower',
            render: {
                fillStyle: '#E59B12',
            },
        });

        const head = Bodies.rectangle(
            x,
            y - 60 * scale, // 60
            34 * scale,
            40 * scale,
            headOptions,
        );
        const chest = Bodies.rectangle(
            x,
            y,
            55 * scale,
            80 * scale,
            chestOptions,
        );
        const rightUpperArm = Bodies.rectangle(
            x + 39 * scale,
            y - 20 * scale,
            20 * scale,
            40 * scale,
            rightArmOptions,
        );
        const rightLowerArm = Bodies.rectangle(
            x + 39 * scale,
            y + 25 * scale,
            20 * scale,
            60 * scale,
            rightLowerArmOptions,
        );
        const leftUpperArm = Bodies.rectangle(
            x - 39 * scale,
            y - 15 * scale,
            20 * scale,
            40 * scale,
            leftArmOptions,
        );
        const leftLowerArm = Bodies.rectangle(
            x - 39 * scale,
            y + 25 * scale,
            20 * scale,
            60 * scale,
            leftLowerArmOptions,
        );
        const leftUpperLeg = Bodies.rectangle(
            x - 20 * scale,
            y + 57 * scale,
            20 * scale,
            40 * scale,
            leftLegOptions,
        );
        const leftLowerLeg = Bodies.rectangle(
            x - 20 * scale,
            y + 97 * scale,
            20 * scale,
            60 * scale,
            leftLowerLegOptions,
        );
        const rightUpperLeg = Bodies.rectangle(
            x + 20 * scale,
            y + 57 * scale,
            20 * scale,
            40 * scale,
            rightLegOptions,
        );
        const rightLowerLeg = Bodies.rectangle(
            x + 20 * scale,
            y + 97 * scale,
            20 * scale,
            60 * scale,
            rightLowerLegOptions,
        );

        const chestToRightUpperArm = Constraint.create({
            bodyA: chest,
            pointA: {
                x: 30 * scale,
                y: -40 * scale,
            },
            pointB: {
                x: 0,
                y: -8 * scale,
            },
            bodyB: rightUpperArm,
            stiffness: 0.6,
        });

        const chestToLeftUpperArm = Constraint.create({
            bodyA: chest,
            pointA: {
                x: -30 * scale,
                y: -40 * scale,
            },
            pointB: {
                x: 0,
                y: -8 * scale,
            },
            bodyB: leftUpperArm,
            stiffness: 0.6,
        });

        const chestToLeftUpperLeg = Constraint.create({
            bodyA: chest,
            pointA: {
                x: -20 * scale,
                y: 30 * scale,
            },
            pointB: {
                x: 0,
                y: -10 * scale,
            },
            bodyB: leftUpperLeg,
            stiffness: 0.6,
        });

        const chestToRightUpperLeg = Constraint.create({
            bodyA: chest,
            pointA: {
                x: 20 * scale,
                y: 30 * scale,
            },
            pointB: {
                x: 0,
                y: -10 * scale,
            },
            bodyB: rightUpperLeg,
            stiffness: 0.6,
        });

        const upperToLowerRightArm = Constraint.create({
            bodyA: rightUpperArm,
            bodyB: rightLowerArm,
            pointA: {
                x: 0,
                y: 15 * scale,
            },
            pointB: {
                x: 0,
                y: -25 * scale,
            },
            stiffness: 0.6,
        });

        const upperToLowerLeftArm = Constraint.create({
            bodyA: leftUpperArm,
            bodyB: leftLowerArm,
            pointA: {
                x: 0,
                y: 15 * scale,
            },
            pointB: {
                x: 0,
                y: -25 * scale,
            },
            stiffness: 0.6,
        });

        const upperToLowerLeftLeg = Constraint.create({
            bodyA: leftUpperLeg,
            bodyB: leftLowerLeg,
            pointA: {
                x: -20,
                y: 25 * scale,
            },
            pointB: {
                x: 0,
                y: -20 * scale,
            },
            stiffness: 0.6,
        });

        const upperToLowerRightLeg = Constraint.create({
            bodyA: rightUpperLeg,
            bodyB: rightLowerLeg,
            pointA: {
                x: 20,
                y: 25 * scale,
            },
            pointB: {
                x: 0,
                y: -20 * scale,
            },
            stiffness: 0.6,
        });

        const headContraint = Constraint.create({
            bodyA: head,
            pointA: {
                x: 0,
                y: 40 * scale,
            },
            pointB: {
                x: 0,
                y: -35 * scale,
            },
            bodyB: chest,
            stiffness: 0.6,
        });

        const person = Composite.create({
            bodies: [
                chest,
                head,
                leftLowerArm,
                leftUpperArm,
                rightLowerArm,
                rightUpperArm,
                leftLowerLeg,
                rightLowerLeg,
                leftUpperLeg,
                rightUpperLeg,
            ],
            constraints: [
                upperToLowerLeftArm,
                upperToLowerRightArm,
                chestToLeftUpperArm,
                chestToRightUpperArm,
                headContraint,
                upperToLowerLeftLeg,
                upperToLowerRightLeg,
                chestToLeftUpperLeg,
                chestToRightUpperLeg,
            ],
        });

        return person;
    }
}
