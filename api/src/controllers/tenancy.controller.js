import { Tenancy } from "../models/tenancy.model.js";
import { User } from "../models/user.model.js";


// Create a new organization / tenant
export async function createTenancy(req, res) {
    try {
        const { name, slug } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
                message: "Organization name and slug are required",
            });
        }

        const existingTenancy = await Tenancy.findOne({ slug });

        if (existingTenancy) {
            return res.status(409).json({
                message: "Organization already exists",
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


// Fetch current user's organization
export async function fetchTenancy(req, res) {
    try {
        const tenantId = req.user.tenantId;

        const tenancy = await Tenancy.findById(tenantId);

        if (!tenancy) {
            return res.status(404).json({
                message: "Organization not found",
            });
        }

        return res.status(200).json({
            tenancy,
        });

    } catch (error) {
        console.error("FETCH TENANCY ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch organization",
        });
    }
}


// Update organization
export async function updateTenancy(req, res) {
    try {
        const tenantId = req.user.tenantId;

        const { name, slug, plan, status } = req.body;

        const tenancy = await Tenancy.findByIdAndUpdate(
            tenantId,
            {
                ...(name !== undefined && { name }),
                ...(slug !== undefined && { slug }),
                ...(plan !== undefined && { plan }),
                ...(status !== undefined && { status }),
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!tenancy) {
            return res.status(404).json({
                message: "Organization not found",
            });
        }

        return res.status(200).json({
            message: "Organization updated successfully",
            tenancy,
        });

    } catch (error) {
        console.error("UPDATE TENANCY ERROR:", error);

        return res.status(500).json({
            message: "Failed to update organization",
        });
    }
}


// Delete organization
export async function deleteTenancy(req, res) {
    try {
        const tenantId = req.user.tenantId;

        const tenancy = await Tenancy.findByIdAndDelete(tenantId);

        if (!tenancy) {
            return res.status(404).json({
                message: "Organization not found",
            });
        }

        await User.updateMany(
            { tenantId },
            {
                $unset: {
                    tenantId: 1,
                },
            }
        );

        return res.status(200).json({
            message: "Organization deleted successfully",
        });

    } catch (error) {
        console.error("DELETE TENANCY ERROR:", error);

        return res.status(500).json({
            message: "Failed to delete organization",
        });
    }
}