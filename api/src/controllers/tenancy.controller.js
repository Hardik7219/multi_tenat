import { Tenancy } from "../models/tenancy.model.js";
import { User } from "../models/user.model.js";


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
            createdBy: req.user.id,
        });

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


export async function fetchTenancy(req, res) {
    try {

        const tenantId = req.params.id;
        if (!tenantId) {
            return res.status(400).json({
                message: "There is no Tenant",
            });
        }
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

        return res.status(500).json({
            message: "Failed to fetch organization",
        });
    }
}

export async function fetchTenancies(req, res) {
    try {
        const { search = "" } = req.query;

        const escapedSearch = String(search)
            .trim()
            .slice(0, 100)
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const query = {
            createdBy: { $ne: req.user.id },
            status: { $ne: "deleted" },
        };

        if (escapedSearch) {
            query.$or = [
                { name: { $regex: escapedSearch, $options: "i" } },
                { slug: { $regex: escapedSearch, $options: "i" } },
                { email: { $regex: escapedSearch, $options: "i" } },
            ];
        }

        const [tenants, total] = await Promise.all([
            Tenancy.find(query)
                .select("name slug email status plan createdAt")
                .sort({ createdAt: -1 })
                .limit(50)
                .lean(),

            Tenancy.countDocuments(query),
        ]);
        return res.status(200).json({
            message: "Organizations fetched successfully",
            tenants,
            total,
        });

    } catch (error) {
        console.error("FETCH TENANCIES ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch organizations",
        });
    }
}
export async function updateTenancy(req, res) {
    try {
        const { tenantId } = req.body;
        if (!tenantId) {
            return res.status(400).json({
                message: "There is no Tenant",
            });
        }
        const tenant = await Tenancy.findById(tenantId);
        if (!tenant.createdBy.equals(req.user.id)) {
            return res.status(403).json({
                message: "Unauthorized to update organization",
            });
        }

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


export async function deleteTenancy(req, res) {
    try {
        const { tenantId } = req.body;
        if (!tenantId) {
            return res.status(400).json({
                message: "There is no Tenant",
            });
        }
        const tenant = await Tenancy.findById(tenantId);
        if (req.user.id !== tenant.createdBy) {
            return res.status(403).json({
                message: "Unauthorized to update organization",
            });
        }

        const tenancy = await Tenancy.findByIdAndDelete(tenantId);

        if (!tenancy) {
            return res.status(404).json({
                message: "Organization not found",
            });
        }

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



export async function fetchMyTenancies(req, res) {
    try {
        const tenants = await Tenancy.find({
            createdBy: req.user.id,
            status: { $ne: "deleted" },
        })
            .select("name slug status plan createdAt")
            .sort({ createdAt: -1 })
            .lean();
        console.log(tenants);

        return res.status(200).json({
            message: "Your organizations fetched successfully",
            tenants,
            total: tenants.length,
        });
    } catch (error) {
        console.error("FETCH MY TENANCIES ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch your organizations",
        });
    }
}