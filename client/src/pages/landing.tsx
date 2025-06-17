import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, FileText, TrendingUp, LogIn } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Insurance Broker
            <span className="text-blue-600"> Management Platform</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your insurance business with our comprehensive platform for managing clients, 
            policies, claims, and pipeline leads in one powerful dashboard.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Sign In to Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Policy Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track and manage all your insurance policies with automated renewals and status updates.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Client Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Maintain detailed client profiles with contact history and communication logs.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <FileText className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Claims Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Streamline claims management with status tracking and document organization.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Sales Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Visualize and manage your sales pipeline from leads to closed deals.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="bg-blue-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Built for Insurance Professionals</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-blue-200">Cloud-Based</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-200">Access Anywhere</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">Secure</div>
              <div className="text-blue-200">Data Protection</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}