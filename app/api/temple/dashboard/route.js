import { NextResponse } from 'next/server'
import {connectDB} from '@/lib/mongoose'
import Temple from '@/models/Temple'

export async function GET(request) {
  try {
    await connectDB()

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [
      totalTemples,
      recentlyAdded,
      templesPerCity,
      templeStatus,
      recentTemples,
    ] = await Promise.all([
      Temple.countDocuments(),
      Temple.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Temple.aggregate([
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { city: '$_id', count: 1, _id: 0 } }
      ]),
      Temple.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Temple.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name city mainDeity status images createdAt')
    ])

    const citiesCovered = templesPerCity.length
    const statusMap = { Active: 0, Inactive: 0 }
    templeStatus.forEach(s => { statusMap[s._id] = s.count })

    return NextResponse.json({
      totalTemples,
      citiesCovered,
      recentlyAdded,
      templesPerCity,
      templeStatus: statusMap,
      recentTemples
    })

  } catch (err) {
    console.error('Dashboard error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
