import { Tenancy } from "../models/tenancy.model.js";
import { User } from "../models/user.model.js";


// Create a new organization / tenant
export async function createTenancy(req, res) {
    try {
        const { name, slug } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
                message: "Please provide both organization name and slug.",
            });
        }

        if (req.user.tenantId) {
            return res.status(400).json({
                message: "User already belongs to an organization",
            });
        }

        const existingTenancy = await Tenancy.findOne({ slug });

        if (existingTenancy) {
            return res.status(409).json({
                message: "Organization with this slug already exists",
            });
        }

        const tenancy = await Tenancy.create({
            name,
            slug,
        });

        await User.findByIdAndUpdate(
            req.user.id,
            {
                tenantId: tenancy._id,
                role: "owner",
            },
            {
                new: true,
            }
        );

        return res.status(201).json({
            message: "Organization created successfully",
            tenancy,
        });

    } catch (error) {
        console.error("CREATE TENANCY ERROR:", error);

        return res.status(500).json({
            message: "Failed to create organization",
        });
    }
}
